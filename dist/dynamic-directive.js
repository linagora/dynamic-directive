'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (angular) {

  var uniqueId = 0;

  var DynamicDirectiveInjection = function DynamicDirectiveInjection(injectionFunction, name, attributes) {
    _classCallCheck(this, DynamicDirectiveInjection);

    if (!name) {
      throw new Error('DynamicInjection: name argument should be a string');
    }
    this.name = name;
    if (!injectionFunction || !angular.isFunction(injectionFunction)) {
      throw new Error('DynamicInjection: injectionFunction argument should be a function');
    }
    this.injectionFunction = injectionFunction;

    this.attributes = this.attributes || []; // [{name: 'class', value: 'cool fun'}, ...]

    this._id = ++uniqueId;
  };

  angular.module('dynamicDirectives', []).provider('dynamicDirectiveService', (function () {
    var injections = {};

    function _ensureInjectionsArray(anchorName) {
      injections[anchorName] = injections[anchorName] || [];
    }

    function getInjections(anchorName, scope) {
      _ensureInjectionsArray(anchorName);
      var ia = injections[anchorName];
      return ia.filter(function (da) {
        return da.injectionFunction(scope);
      });
    }

    function _addInjection(anchorName, da) {
      _ensureInjectionsArray(anchorName);
      injections[anchorName].push(da);
    }

    return {
      addInjection: _addInjection,
      DynamicDirective: DynamicDirectiveInjection,
      $get: ['$rootScope', function ($rootScope) {
        return {
          DynamicDirective: DynamicDirectiveInjection,
          getInjections: getInjections,
          addInjection: function addInjection(anchorName, da) {
            _addInjection(anchorName, da);
            $rootScope.$broadcast('dynamicDirectiveInjectionUpdated', anchorName, da);
          }
        };
      }]
    };
  })()).directive('dynamicDirective', ['$compile', 'dynamicDirectiveService', function ($compile, dynamicDirectiveService) {

    var DYNAMIC_DIRECTIVE_ID = 'dynamic-directive-id';

    function link(scope, element, attrs) {
      function appendDirective(dynamicDirective) {
        var template = angular.element(buildHtmlFromInjectionData(dynamicDirective));
        var newElt = $compile(template)(scope);
        element.append(newElt);
      }

      var buildHtmlFromInjectionData = function buildHtmlFromInjectionData(dynamicDirective) {
        var attributes = {};
        attributes[DYNAMIC_DIRECTIVE_ID] = dynamicDirective._id;

        dynamicDirective.attributes.forEach(function (attribute) {
          return attributes[attribute.name] = attribute.value;
        });

        var e = angular.element('<' + dynamicDirective.name + '/>');
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

      var anchorName = attrs.dynamicDirective;
      element.hide();

      var dynamicDirectives = dynamicDirectiveService.getInjections(anchorName, scope);

      dynamicDirectives.forEach(appendDirective);
      fixVisibility();

      scope.$on('dynamicDirectiveInjectionUpdated', function (name) {
        if (name !== anchorName) {
          return;
        }
        var dynamicDirectives = dynamicDirectiveService.getInjections(anchorName, scope);
        var dIds = {},
            currentIds = {};
        dynamicDirectives.forEach(function (d) {
          return dIds[d._id] = d;
        });

        element.children().each(function (index, elt) {
          var $e = angular.element(elt),
              directiveId = $e.attr(DYNAMIC_DIRECTIVE_ID);
          if (!dIds[directiveId]) {
            $e.remove();
            return;
          }
          currentIds[directiveId] = true;
        });

        Object.keys(dIds).forEach(function (id) {
          if (!currentIds[id]) {
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
  }]);
})(angular);
//# sourceMappingURL=dynamic-directive.js.map
