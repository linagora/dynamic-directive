'use strict';

(function(angular) {

  var uniqueId = 0;

  class DynamicDirectiveInjection {

    constructor(injectionFunction, name, attributes) {
      if ( !name ) {
        throw new Error('DynamicInjection: name argument should be a string');
      }
      this.name = name;
      if ( !injectionFunction || !angular.isFunction(injectionFunction) ) {
        throw new Error('DynamicInjection: injectionFunction argument should be a function');
      }
      this.injectionFunction = injectionFunction;

      this.attributes = this.attributes || []; // [{name: 'class', value: 'cool fun'}, ...]

      this._id = ++uniqueId;
    }

  }

  angular.module('dynamicDirectives', [])
  .provider('dynamicDirectiveService', (function() {
    let injections = {};

    function _ensureInjectionsArray(anchorName) {
      injections[anchorName] = injections[anchorName] || [];
    }

    function getInjections(anchorName, scope) {
      _ensureInjectionsArray(anchorName);
      let ia = injections[anchorName];
      return ia.filter( (da) => da.injectionFunction(scope) );
    }

    function addInjection(anchorName, da) {
      _ensureInjectionsArray(anchorName);
      injections[anchorName].push(da);
    }

    return {
      addInjection: addInjection,
      DynamicDirective: DynamicDirectiveInjection,
      $get: ['$rootScope', function($rootScope) {
        return {
          DynamicDirective: DynamicDirectiveInjection,
          getInjections: getInjections,
          addInjection: function(anchorName, da) {
            addInjection(anchorName, da);
            $rootScope.$broadcast('dynamicDirectiveInjectionUpdated', anchorName, da);
          }
        };
      }]
    };
  })())
  .directive('dynamicDirective', ['$compile', 'dynamicDirectiveService', function($compile, dynamicDirectiveService) {

    const DYNAMIC_DIRECTIVE_ID = 'dynamic-directive-id';

    function link(scope, element, attrs) {
      function appendDirective(dynamicDirective) {
        let template = angular.element(buildHtmlFromInjectionData(dynamicDirective));
        let newElt = $compile(template)(scope);
        element.append(newElt);
      }

      let buildHtmlFromInjectionData = function(dynamicDirective) {
        let attributes = {};
        attributes[DYNAMIC_DIRECTIVE_ID] = dynamicDirective._id;

        dynamicDirective.attributes.forEach( (attribute) => attributes[attribute.name] = attribute.value );

        let e = angular.element('<' + dynamicDirective.name + '/>');
        e.attr(attributes);
        return e;
      };

      function fixVisibility() {
        if (element.children().length) {
          element.show();
        } else {
          element.hide();
        }
      }

      let anchorName = attrs.dynamicDirective;
      element.hide();

      let dynamicDirectives = dynamicDirectiveService.getInjections(anchorName, scope);

      dynamicDirectives.forEach(appendDirective);
      fixVisibility();

      scope.$on('dynamicDirectiveInjectionUpdated', function(name) {
        if ( name !== anchorName ) {
          return ;
        }
        let dynamicDirectives = dynamicDirectiveService.getInjections(anchorName, scope);
        let dIds = {}, currentIds = {};
        dynamicDirectives.forEach( (d) => dIds[d._id] = d );

        element.children().each((index, elt) => {
          let $e = angular.element(elt), directiveId = $e.attr(DYNAMIC_DIRECTIVE_ID);
          if ( !dIds[directiveId] ) {
            $e.remove();
            return ;
          }
          currentIds[directiveId] = true;
        });

        Object.keys(dIds).forEach( (id) => {
          if ( !currentIds[id] ) {
            appendDirective(dIds[id]);
          }
        });
        fixVisibility();
      });
    }

    return {
      restrict: 'A',
      link: link
    };
  }])
  ;
})(angular);
