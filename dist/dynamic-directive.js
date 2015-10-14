'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (angular) {

  var uniqueId = 0;
  var DEFAULT_PRIORITY = 0;

  var DynamicDirective = function DynamicDirective(injectionFunction, name, options) {
    _classCallCheck(this, DynamicDirective);

    if (!name) {
      throw new Error('DynamicInjection: name argument should be a string');
    }
    this.name = name;

    if (injectionFunction === true) {
      injectionFunction = function () {
        return true;
      };
    } else if (!injectionFunction || !angular.isFunction(injectionFunction)) {
      throw new Error('DynamicInjection: injectionFunction argument should be a function');
    }
    this.injectionFunction = injectionFunction;
    options = options || {};
    this.attributes = options.attributes || [];
    this.scope = options.scope || undefined;
    this.priority = !isNaN(parseInt(options.priority, 10)) ? parseInt(options.priority, 10) : DEFAULT_PRIORITY;

    this._id = ++uniqueId;
  };

  angular.module('op.dynamicDirective', []).provider('dynamicDirectiveService', (function () {
    var injections = {};

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

    function _resetInjections(anchorName) {
      injections[anchorName] = [];
    }

    function orderInjections(injections) {
      injections.sort(_dynamicDirectivesSort);
      return injections;
    }

    return {
      addInjection: _addInjection,
      DynamicDirective: DynamicDirective,
      $get: ['$rootScope', function ($rootScope) {
        return {
          DynamicDirective: DynamicDirective,
          getInjections: getInjections,
          sort: orderInjections,
          addInjection: function addInjection(anchorName, da) {
            _addInjection(anchorName, da);
            $rootScope.$broadcast('dynamicDirectiveInjectionUpdated', anchorName, da);
          },
          resetInjections: function resetInjections(anchorName) {
            _resetInjections(anchorName);
            $rootScope.$broadcast('dynamicDirectiveInjectionUpdated', anchorName);
          }
        };
      }]
    };
  })()).value('DynamicDirective', DynamicDirective).directive('dynamicDirective', ['$compile', 'dynamicDirectiveService', function ($compile, dynamicDirectiveService) {

    var DYNAMIC_DIRECTIVE_ID = 'dynamic-directive-id';

    function orderDirectives(element, dynamicDirectives) {
      var orderedIds = dynamicDirectiveService.sort(dynamicDirectives).map(function (d) {
        return d._id;
      });
      var domIds = element.children('[' + DYNAMIC_DIRECTIVE_ID + ']').map(function (index, e) {
        return parseInt(angular.element(e).attr(DYNAMIC_DIRECTIVE_ID), 10);
      }).toArray();
      // 99% of the time
      if (orderedIds.join(',') === domIds.join(',')) {
        return;
      }

      for (var i = 0, len = orderedIds.length - 2; i <= len; i++) {
        var current = orderedIds[i],
            next = orderedIds[i + 1],
            $current = element.children('[' + DYNAMIC_DIRECTIVE_ID + '=' + current + ']');
        if ($current.next().attr(DYNAMIC_DIRECTIVE_ID) !== next) {
          element.children('[' + DYNAMIC_DIRECTIVE_ID + '=' + next + ']').insertAfter($current);
        }
      }
    }

    function link(scope, element, attrs) {
      function appendDirective(dynamicDirective) {
        var template = angular.element(buildHtmlFromInjectionData(dynamicDirective));
        var newElt = $compile(template)(dynamicDirective.scope || scope);
        element.append(newElt);
      }

      function buildHtmlFromInjectionData(dynamicDirective) {
        var attributes = {};
        attributes[DYNAMIC_DIRECTIVE_ID] = dynamicDirective._id;
        dynamicDirective.attributes.forEach(function (attribute) {
          return attributes[attribute.name] = attribute.value;
        });
        var e = angular.element('<' + dynamicDirective.name + '/>');
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

      var anchorName = attrs.dynamicDirective;
      element.hide();

      var dynamicDirectives = dynamicDirectiveService.sort(dynamicDirectiveService.getInjections(anchorName, scope));

      dynamicDirectives.forEach(appendDirective);
      fixVisibility();

      scope.$on('dynamicDirectiveInjectionUpdated', function (evt, name) {
        if (name !== anchorName) {
          return;
        }
        var dynamicDirectives = dynamicDirectiveService.sort(dynamicDirectiveService.getInjections(anchorName, scope));
        var dIds = {},
            currentIds = {};
        dynamicDirectives.forEach(function (d) {
          return dIds[d._id] = d;
        });

        element.children().each(function (index, elt) {
          var $e = angular.element(elt),
              directiveId = $e.attr(DYNAMIC_DIRECTIVE_ID);
          if (!directiveId) {
            return;
          }

          if (!dIds[directiveId]) {
            $e.remove();
            return;
          }
          currentIds[directiveId] = true;
        });

        var dIdsCount = Object.keys(dIds).length,
            currentIdsCount = Object.keys(currentIds).length;
        if (dIdsCount !== currentIdsCount) {
          Object.keys(dIds).forEach(function (id) {
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
//# sourceMappingURL=dynamic-directive.js.map
