'use strict';

(function(angular) {

  var uniqueId = 0;
  const DEFAULT_PRIORITY = 0;

  class DynamicDirective {

    constructor(injectionFunction, name, options) {
      if (!name) {
        throw new Error('DynamicInjection: name argument should be a string');
      }
      this.name = name;

      if (injectionFunction === true) {
        injectionFunction = function() { return true; };
      } else if (!injectionFunction || !angular.isFunction(injectionFunction)) {
        throw new Error('DynamicInjection: injectionFunction argument should be a function');
      }
      this.injectionFunction = injectionFunction;
      options = options || {};
      this.attributes = options.attributes || [];
      this.scope = options.scope || undefined;
      this.priority = !isNaN(parseInt(options.priority, 10)) ? parseInt(options.priority, 10) : DEFAULT_PRIORITY;

      this._id = ++uniqueId;
    }

  }

  angular.module('op.dynamicDirective', [])
  .provider('dynamicDirectiveService', (function() {
    let injections = {};

    function _dynamicDirectivesSortByName(a, b, onEquality) {
      if (b.name < a.name) {
        return -1;
      } else if (b.name > a.name) {
        return 1;
      } else {
        return onEquality(a, b);
      }
    }

    function _dynamicDirectivesSortByid(a, b) {
      if (b._id < a._id) {
        return -1;
      } else if (b._id > a._id) {
        return 1;
      } else {
        return 0;
      }
    }

    function _dynamicDirectivesSort(a, b) {
      var prio = b.priority - a.priority;
      if (prio !== 0) {
        return prio;
      }
      if (b.name < a.name) {
        return -1;
      } else if (b.name > a.name) {
        return 1;
      } else {
        return _dynamicDirectivesSortByName(a, b, _dynamicDirectivesSortByid);
      }
    }

    function _ensureInjectionsArray(anchorName) {
      injections[anchorName] = injections[anchorName] || [];
    }

    function getInjections(anchorName, scope) {
      _ensureInjectionsArray(anchorName);
      let ia = injections[anchorName];
      return ia.filter((da) => da.injectionFunction(scope));
    }

    function addInjection(anchorName, da) {
      _ensureInjectionsArray(anchorName);
      injections[anchorName].push(da);
    }

    function resetInjections(anchorName) {
      injections[anchorName] = [];
    }

    function orderInjections(injections) {
      injections.sort(_dynamicDirectivesSort);
      return injections;
    }

    return {
      addInjection: addInjection,
      DynamicDirective: DynamicDirective,
      $get: ['$rootScope', function($rootScope) {
        return {
          DynamicDirective: DynamicDirective,
          getInjections: getInjections,
          sort: orderInjections,
          addInjection: function(anchorName, da) {
            addInjection(anchorName, da);
            $rootScope.$broadcast('dynamicDirectiveInjectionUpdated', anchorName, da);
          },
          resetInjections: function(anchorName) {
            resetInjections(anchorName);
            $rootScope.$broadcast('dynamicDirectiveInjectionUpdated', anchorName);
          }
        };
      }]
    };
  })())
  .value('DynamicDirective', DynamicDirective)
  .directive('dynamicDirective', ['$compile', 'dynamicDirectiveService', function($compile, dynamicDirectiveService) {

    const DYNAMIC_DIRECTIVE_ID = 'dynamic-directive-id';

    function orderDirectives(element, dynamicDirectives) {
      let orderedIds = dynamicDirectiveService.sort(dynamicDirectives).map((d) => d._id);
      let domIds = element.children('[' + DYNAMIC_DIRECTIVE_ID + ']')
                    .map((index, e) => parseInt(angular.element(e).attr(DYNAMIC_DIRECTIVE_ID), 10))
                    .toArray();
      // 99% of the time
      if (orderedIds.join(',') === domIds.join(',')) {
        return;
      }

      for (let i = 0, len = orderedIds.length - 2; i <= len; i++) {
        let current = orderedIds[i], next = orderedIds[(i + 1)],
            $current = element.children('[' + DYNAMIC_DIRECTIVE_ID + '=' + current + ']');
        if ($current.next().attr(DYNAMIC_DIRECTIVE_ID) !== next) {
          element.children('[' + DYNAMIC_DIRECTIVE_ID + '=' + next + ']').insertAfter($current);
        }
      }
    }

    function link(scope, element, attrs) {
      function appendDirective(dynamicDirective) {
        let template = angular.element(buildHtmlFromInjectionData(dynamicDirective));
        let newElt = $compile(template)(dynamicDirective.scope || scope);
        element.append(newElt);
      }

      function buildHtmlFromInjectionData(dynamicDirective) {
        let attributes = {};
        attributes[DYNAMIC_DIRECTIVE_ID] = dynamicDirective._id;
        dynamicDirective.attributes.forEach((attribute) => attributes[attribute.name] = attribute.value);
        let e = angular.element('<' + dynamicDirective.name + '/>');
        e.attr(attributes);
        return e;
      }

      function fixVisibility() {
        if (element.children().length) {
          element.show();
        } else {
          element.hide();
        }
      }

      let anchorName = attrs.dynamicDirective;
      element.hide();

      let dynamicDirectives = dynamicDirectiveService.sort(dynamicDirectiveService.getInjections(anchorName, scope));

      dynamicDirectives.forEach(appendDirective);
      fixVisibility();

      scope.$on('dynamicDirectiveInjectionUpdated', function(evt, name) {
        if (name !== anchorName) {
          return;
        }
        let dynamicDirectives = dynamicDirectiveService.sort(dynamicDirectiveService.getInjections(anchorName, scope));
        let dIds = {}, currentIds = {};
        dynamicDirectives.forEach((d) => dIds[d._id] = d);

        element.children().each((index, elt) => {
          let $e = angular.element(elt), directiveId = $e.attr(DYNAMIC_DIRECTIVE_ID);
          if (!directiveId) {
            return;
          }

          if (!dIds[directiveId]) {
            $e.remove();
            return;
          }
          currentIds[directiveId] = true;
        });

        let dIdsCount = Object.keys(dIds).length, currentIdsCount = Object.keys(currentIds).length;
        if (dIdsCount !== currentIdsCount) {
          Object.keys(dIds).forEach((id) => {
            if (!currentIds[id]) {
              appendDirective(dIds[id]);
            }
          });
        }
        orderDirectives(element, dynamicDirectives);
        fixVisibility();
      });
    }

    return {
      restrict: 'A',
      link: link
    };
  }]);
})(angular);
