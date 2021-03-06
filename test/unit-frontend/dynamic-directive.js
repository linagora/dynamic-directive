'use strict';

/* global chai: false */
var expect = chai.expect;

describe('The dynamic-directive angular module', function() {
  var truefn = function() {return true;};

  beforeEach(function() {
    angular.mock.module('op.dynamicDirective');
  });

  describe('DynamicDirective service', function() {
    beforeEach(function() {
      var self = this;
      inject(function(DynamicDirective) {
        self.DynamicDirective = DynamicDirective;
      });
    });

    it('should be a function', function() {
      expect(this.DynamicDirective).to.be.a('function');
    });

    it('should throw an error when instancied without new', function() {
      var DynamicDirective = this.DynamicDirective;
      function test() {
        /* jshint newcap: false */
        DynamicDirective(true, 'test');
      }
      expect(test).to.throw();
    });
  });

  describe('dynamicDirectiveService provider', function() {
    var DynamicDirective, service, provider;

    beforeEach(function() {
      angular.mock.module(function(dynamicDirectiveServiceProvider) {
        provider = dynamicDirectiveServiceProvider;
      });
    });

    beforeEach(inject(function(_DynamicDirective_, _dynamicDirectiveService_) {
      DynamicDirective = _DynamicDirective_;
      service = _dynamicDirectiveService_;
    }));

    it('should have a addInjection() method', function() {
      expect(provider).to.respondTo('addInjection');
    });

    it('should expose the DynamicDirective object', function() {
      expect(provider).to.have.property('DynamicDirective');
      expect(provider.DynamicDirective).to.be.a('function');
    });

    describe('The resetAllInjections method', function() {

      it('should reset all injections', function() {
        provider.addInjection('test-anchor-point', new DynamicDirective(true, 'test-directive'));
        provider.addInjection('test-second-anchor-point', new DynamicDirective(true, 'test-second-directive'));
        provider.resetAllInjections();

        expect(service.getInjections('test-anchor-point', {})).to.have.length(0);
        expect(service.getInjections('test-second-anchor-point', {})).to.have.length(0);
      });

    });

  });

  describe('dynamicDirectiveService', function() {
    beforeEach(function() {
      var self = this;
      inject(function(dynamicDirectiveService, $rootScope) {
        self.service = dynamicDirectiveService;
        this.$rootScope = $rootScope;
      });
    });

    it('should allow registration of a DynamicDirective', function() {
      var dd1 = new this.service.DynamicDirective(truefn, 'dd1');
      this.service.addInjection('ap1.1', dd1);
    });
    it('should allow registration of several DynamicDirective', function() {
      var dd1 = new this.service.DynamicDirective(truefn, 'dd1');
      var dd2 = new this.service.DynamicDirective(truefn, 'dd2');
      var dd3 = new this.service.DynamicDirective(truefn, 'dd3');
      var dd4 = new this.service.DynamicDirective(truefn, 'dd4');
      var dd5 = new this.service.DynamicDirective(truefn, 'dd5');
      this.service.addInjection('ap2.1', dd1);
      this.service.addInjection('ap2.1', dd2);
      this.service.addInjection('ap2.2', dd3);
      this.service.addInjection('ap2.1', dd4);
      this.service.addInjection('ap2.1', dd5);
    });
    it('should broadcast a dynamicDirectiveInjectionUpdated event on directive registration', function(done) {
      var scope = this.$rootScope.$new();
      scope.$on('dynamicDirectiveInjectionUpdated', function() {
        done();
      });
      var dd1 = new this.service.DynamicDirective(truefn, 'dd1');
      this.service.addInjection('ap2.1', dd1);
    });

    describe('DynamicDirective constructor', function() {
      it('should set attributes to [], scope to undefined and priority to 0 if not provided', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1');
        expect(dd1.scope).to.be.undefined;
        expect(dd1.attributes).to.deep.equal([]);
        expect(dd1.priority).to.equal(0);
      });
      it('should set attributes to a specific array, scope to specified one and priority to 100 if provided', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1', {
          scope: { aScope: 'aScope' },
          priority: 100,
          attributes: ['anArray']
        });
        expect(dd1.scope).to.deep.equal({ aScope: 'aScope' });
        expect(dd1.attributes).to.deep.equal(['anArray']);
        expect(dd1.priority).to.equal(100);
      });
    });

    describe('getInjections() method', function() {
      it('should allow retrieval of several DynamicDirective', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1');
        var dd2 = new this.service.DynamicDirective(truefn, 'dd2');
        var dd3 = new this.service.DynamicDirective(truefn, 'dd3');
        var dd4 = new this.service.DynamicDirective(truefn, 'dd4');
        var dd5 = new this.service.DynamicDirective(truefn, 'dd5');
        this.service.addInjection('ap3.1', dd1);
        this.service.addInjection('ap3.1', dd2);
        this.service.addInjection('ap3.2', dd3);
        this.service.addInjection('ap3.1', dd4);
        this.service.addInjection('ap3.1', dd5);
        var ddSet1 = this.service.getInjections('ap3.1', {});
        var ddSet2 = this.service.getInjections('ap3.2', {});
        expect(ddSet1).to.deep.equal([dd1, dd2, dd4, dd5]);
        expect(ddSet2).to.deep.equal([dd3]);
      });
      it('should call the directive injection method', function() {
        var falsefn = function() { return false; };
        var gotCommunityInScope = function(scope) { return scope.community ? true : false; };
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1');
        var dd2 = new this.service.DynamicDirective(falsefn, 'dd2');
        var dd3 = new this.service.DynamicDirective(truefn, 'dd3');
        var dd4 = new this.service.DynamicDirective(gotCommunityInScope, 'dd4');
        var dd5 = new this.service.DynamicDirective(truefn, 'dd5');
        this.service.addInjection('ap4.1', dd1);
        this.service.addInjection('ap4.1', dd2);
        this.service.addInjection('ap4.2', dd3);
        this.service.addInjection('ap4.1', dd4);
        this.service.addInjection('ap4.1', dd5);
        var ddSet1 = this.service.getInjections('ap4.1', {});
        var ddSet2 = this.service.getInjections('ap4.2', {});
        var ddSet3 = this.service.getInjections('ap4.1', { community: true });
        expect(ddSet1).to.deep.equal([dd1, dd5]);
        expect(ddSet2).to.deep.equal([dd3]);
        expect(ddSet3).to.deep.equal([dd1, dd4, dd5]);
      });

      it('should allow condition function shortcut "true"', function() {
        var dd1 = new this.service.DynamicDirective(true, 'dd1');
        var dd2 = new this.service.DynamicDirective(true, 'dd2');
        this.service.addInjection('ap4.4', dd1);
        this.service.addInjection('ap4.4', dd2);
        var ddSet1 = this.service.getInjections('ap4.4', {});
        expect(ddSet1).to.deep.equal([dd1, dd2]);
      });
    });

    describe('sort() method', function() {
      it('should sort by priority', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1', { priority: 1 });
        var dd2 = new this.service.DynamicDirective(truefn, 'dd2', { priority: 2 });
        var dd3 = new this.service.DynamicDirective(truefn, 'dd3', { priority: 0 });
        var dd4 = new this.service.DynamicDirective(truefn, 'dd4', { priority: 5 });
        var dd5 = new this.service.DynamicDirective(truefn, 'dd5', { priority: 4 });
        this.service.addInjection('ap5', dd1);
        this.service.addInjection('ap5', dd2);
        this.service.addInjection('ap5', dd3);
        this.service.addInjection('ap5', dd4);
        this.service.addInjection('ap5', dd5);
        var ddSet1 = this.service.sort(this.service.getInjections('ap5', {}));
        expect(ddSet1).to.deep.equal([dd4, dd5, dd2, dd1, dd3]);
      });
      it('should sort by name', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1', { priority: 1 });
        var dd2 = new this.service.DynamicDirective(truefn, 'dd2', { priority: 1 });
        var dd3 = new this.service.DynamicDirective(truefn, 'dd3', { priority: 1 });
        var dd4 = new this.service.DynamicDirective(truefn, 'dd4', { priority: 1 });
        var dd5 = new this.service.DynamicDirective(truefn, 'dd5', { priority: 1 });
        this.service.addInjection('ap6', dd2);
        this.service.addInjection('ap6', dd1);
        this.service.addInjection('ap6', dd3);
        this.service.addInjection('ap6', dd5);
        this.service.addInjection('ap6', dd4);
        var ddSet1 = this.service.sort(this.service.getInjections('ap6', {}));
        expect(ddSet1).to.deep.equal([dd5, dd4, dd3, dd2, dd1]);
      });
      it('should sort by priority and then by name', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1', { priority: 1 });
        var dd2 = new this.service.DynamicDirective(truefn, 'dd2', { priority: 3 });
        var dd3 = new this.service.DynamicDirective(truefn, 'dd3', { priority: 2 });
        var dd4 = new this.service.DynamicDirective(truefn, 'dd4', { priority: 1 });
        var dd5 = new this.service.DynamicDirective(truefn, 'dd5', { priority: 1 });
        this.service.addInjection('ap7', dd2);
        this.service.addInjection('ap7', dd1);
        this.service.addInjection('ap7', dd3);
        this.service.addInjection('ap7', dd5);
        this.service.addInjection('ap7', dd4);
        var ddSet1 = this.service.sort(this.service.getInjections('ap7', {}));
        expect(ddSet1).to.deep.equal([dd2, dd3, dd5, dd4, dd1]);
      });
    });

    describe('resetInjections method', function() {
      before(function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1');
        var dd2 = new this.service.DynamicDirective(truefn, 'dd2');

        this.service.addInjection('ap8', dd1);
        this.service.addInjection('ap8', dd2);
      });

      it('should set injections to [] and broadcast dynamicDirectiveInjectionUpdated event', function(done) {
        var scope = this.$rootScope.$new();
        var self = this;
        scope.$on('dynamicDirectiveInjectionUpdated', function() {
          var ddSet1 = self.service.getInjections('ap8', {});
          expect(ddSet1).to.deep.equal([]);
          done();
        });

        this.service.resetInjections('ap8');
      });
    });
  });

  describe('dynamicDirective directive', function() {
    beforeEach(function() {

      angular.module('test', ['op.dynamicDirective'])
      .directive('dir1', function() {
        return {
          restrict: 'E',
          template: '<div class="dir1">Hi</div>'
        };
      })
      .directive('dir2', function() {
        return {
          restrict: 'E',
          replace: true,
          template: '<div class="dir2">Hi</div>'
        };
      })
      .directive('dir3', function() {
        return {
          restrict: 'E',
          replace: true,
          template: '<div class="dir3">Hi</div>'
        };
      });
      angular.mock.module('test');

      inject(function($rootScope, dynamicDirectiveService, $compile) {
        this.service = dynamicDirectiveService;
        this.$rootScope = $rootScope;
        this.$compile = $compile;
        this.scope = this.$rootScope.$new();
      });
    });

    it('should inject a directive', function() {
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1');
      this.service.addInjection('aap1', dd1);
      var html = '<div dynamic-directive="aap1"></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      expect(elt.find('.dir1')).to.have.length(1);
    });

    it('should inject a directive dynamically', function() {
      var ap = 'aap2';
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1');
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2');
      this.service.addInjection(ap, dd1);
      var html = '<div dynamic-directive="' + ap + '"></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      this.service.addInjection(ap, dd2);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(2);
      expect(elt.children().eq(0).hasClass('dir2')).to.be.true;
      expect(elt.children().eq(1).prop('tagName')).to.equal('DIR1');
    });

    it('should respect the directive priority in the injection (higher next)', function() {
      var ap = 'aap3';
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', { priority: 1 });
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2', { priority: 1 });
      var dd3 = new this.service.DynamicDirective(truefn, 'dir3', { priority: 10 });
      this.service.addInjection(ap, dd1);
      this.service.addInjection(ap, dd2);
      var html = '<div dynamic-directive="' + ap + '"></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      this.service.addInjection(ap, dd3);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(3);
      expect(elt.children().eq(0).hasClass('dir3')).to.be.true;
    });

    it('should respect the directive priority in the injection (lower next)', function() {
      var ap = 'aap4';
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', { priority: 10 });
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2', { priority: 10 });
      var dd3 = new this.service.DynamicDirective(truefn, 'dir3', { priority: 1 });
      this.service.addInjection(ap, dd1);
      this.service.addInjection(ap, dd2);
      var html = '<div dynamic-directive="' + ap + '"></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      this.service.addInjection(ap, dd3);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(3);
      expect(elt.children().eq(2).hasClass('dir3')).to.be.true;
    });

    it('should respect the directive priority in the injection (middle next)', function() {
      var ap = 'aap5';
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', { priority: 10 });
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2', { priority: 1 });
      var dd3 = new this.service.DynamicDirective(truefn, 'dir3', { priority: 5 });
      this.service.addInjection(ap, dd1);
      this.service.addInjection(ap, dd2);
      var html = '<div dynamic-directive="' + ap + '"></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      this.service.addInjection(ap, dd3);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(3);
      expect(elt.children().eq(1).hasClass('dir3')).to.be.true;
    });

    it('should propagate attributes', function() {
      var ap = 'aap6';
      var attributes = [
        {
          name: 'addressbook',
          value: 'addressbook'
        },
        {
          name: 'contact',
          value: 'contact'
        }
      ];
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', { attributes: attributes, priority: 10 });
      this.service.addInjection(ap, dd1);
      var html = '<div dynamic-directive="' + ap + '"></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(1);
      var dd1dom = elt.children().eq(0);
      attributes.forEach(function(attr) {
        expect(dd1dom.attr(attr.name)).to.equal(attr.value);
      });
    });

    it('should ignore the existing container contents', function() {
      var ap = 'aap7';
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', { priority: 10 });
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2', { priority: 1 });
      var dd3 = new this.service.DynamicDirective(truefn, 'dir3', { priority: 5 });
      this.service.addInjection(ap, dd1);
      this.service.addInjection(ap, dd2);
      var html = '<div dynamic-directive="' + ap + '"><div>I exist</div><span>Me too</span></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      this.service.addInjection(ap, dd3);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(5);
      expect(elt.children().eq(4).hasClass('dir2')).to.be.true;
      expect(elt.children().eq(3).hasClass('dir3')).to.be.true;
      expect(elt.children().eq(2).prop('tagName')).to.equal('DIR1');
    });

    it('should override the scope of the directive if provided', function(done) {
      var ap = 'aap8';
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', { priority: 10, scope:{ doSomething: done } });
      this.service.addInjection(ap, dd1);
      var html = '<div dynamic-directive="' + ap + '"></div>';
      var elt = this.$compile(html)(this.scope);
      this.scope.$digest();
      var dirScope = elt.find('.dir1').scope();
      dirScope.doSomething();
    });

  });

});
