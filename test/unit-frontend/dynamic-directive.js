'use strict';

/* global chai: false */
var expect = chai.expect;

describe('The dynamic-directive angular module', function() {
  var truefn = function() {return true;};

  beforeEach(function() {
    angular.mock.module('op.dynamicDirective');
  });

  describe('dynamicDirectiveService provider', function() {
    beforeEach(function() {
      var self = this;
      angular.mock.module(function(dynamicDirectiveServiceProvider) {
        self.provider = dynamicDirectiveServiceProvider;
      });
    });
    beforeEach(inject());

    it('should have a addInjection() method', function() {
      expect(this.provider).to.respondTo('addInjection');
    });
    it('should expose the DynamicDirective object', function() {
      expect(this.provider).to.have.property('DynamicDirective');
      expect(this.provider.DynamicDirective).to.be.a('function');
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
        var gotCommunityInScope = function(scope) { return scope.community ? true: false; };
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
        var ddSet3 = this.service.getInjections('ap4.1', {community: true});
        expect(ddSet1).to.deep.equal([dd1, dd5]);
        expect(ddSet2).to.deep.equal([dd3]);
        expect(ddSet3).to.deep.equal([dd1, dd4, dd5]);
      });
    });

    describe('sort() method', function() {
      it('should sort by priority', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1', undefined, 1);
        var dd2 = new this.service.DynamicDirective(truefn, 'dd2', undefined, 2);
        var dd3 = new this.service.DynamicDirective(truefn, 'dd3', undefined, 0);
        var dd4 = new this.service.DynamicDirective(truefn, 'dd4', undefined, 5);
        var dd5 = new this.service.DynamicDirective(truefn, 'dd5', undefined, 4);
        this.service.addInjection('ap5', dd1);
        this.service.addInjection('ap5', dd2);
        this.service.addInjection('ap5', dd3);
        this.service.addInjection('ap5', dd4);
        this.service.addInjection('ap5', dd5);
        var ddSet1 = this.service.sort(this.service.getInjections('ap5', {}));
        expect(ddSet1).to.deep.equal([dd4, dd5, dd2, dd1, dd3]);
      });
      it('should sort by name', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1', undefined, 1);
        var dd2 = new this.service.DynamicDirective(truefn, 'dd2', undefined, 1);
        var dd3 = new this.service.DynamicDirective(truefn, 'dd3', undefined, 1);
        var dd4 = new this.service.DynamicDirective(truefn, 'dd4', undefined, 1);
        var dd5 = new this.service.DynamicDirective(truefn, 'dd5', undefined, 1);
        this.service.addInjection('ap6', dd2);
        this.service.addInjection('ap6', dd1);
        this.service.addInjection('ap6', dd3);
        this.service.addInjection('ap6', dd5);
        this.service.addInjection('ap6', dd4);
        var ddSet1 = this.service.sort(this.service.getInjections('ap6', {}));
        expect(ddSet1).to.deep.equal([dd5, dd4, dd3, dd2, dd1]);
      });
      it('should sort by priority and then by name', function() {
        var dd1 = new this.service.DynamicDirective(truefn, 'dd1', undefined, 1);
        var dd2 = new this.service.DynamicDirective(truefn, 'dd2', undefined, 3);
        var dd3 = new this.service.DynamicDirective(truefn, 'dd3', undefined, 2);
        var dd4 = new this.service.DynamicDirective(truefn, 'dd4', undefined, 1);
        var dd5 = new this.service.DynamicDirective(truefn, 'dd5', undefined, 1);
        this.service.addInjection('ap7', dd2);
        this.service.addInjection('ap7', dd1);
        this.service.addInjection('ap7', dd3);
        this.service.addInjection('ap7', dd5);
        this.service.addInjection('ap7', dd4);
        var ddSet1 = this.service.sort(this.service.getInjections('ap7', {}));
        expect(ddSet1).to.deep.equal([dd2, dd3, dd5, dd4, dd1]);
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
      var html = '<div dynamic-directive="'+ap+'"></div>';
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
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', undefined, 1);
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2', undefined, 1);
      var dd3 = new this.service.DynamicDirective(truefn, 'dir3', undefined, 10);
      this.service.addInjection(ap, dd1);
      this.service.addInjection(ap, dd2);
      var html = '<div dynamic-directive="'+ap+'"></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      this.service.addInjection(ap, dd3);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(3);
      expect(elt.children().eq(0).hasClass('dir3')).to.be.true;
    });

    it('should respect the directive priority in the injection (lower next)', function() {
      var ap = 'aap4';
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', undefined, 10);
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2', undefined, 10);
      var dd3 = new this.service.DynamicDirective(truefn, 'dir3', undefined, 1);
      this.service.addInjection(ap, dd1);
      this.service.addInjection(ap, dd2);
      var html = '<div dynamic-directive="'+ap+'"></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      this.service.addInjection(ap, dd3);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(3);
      expect(elt.children().eq(2).hasClass('dir3')).to.be.true;
    });

    it('should respect the directive priority in the injection (middle next)', function() {
      var ap = 'aap5';
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', undefined, 10);
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2', undefined, 1);
      var dd3 = new this.service.DynamicDirective(truefn, 'dir3', undefined, 5);
      this.service.addInjection(ap, dd1);
      this.service.addInjection(ap, dd2);
      var html = '<div dynamic-directive="'+ap+'"></div>';
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
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', attributes, 10);
      this.service.addInjection(ap, dd1);
      var html = '<div dynamic-directive="'+ap+'"></div>';
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
      var dd1 = new this.service.DynamicDirective(truefn, 'dir1', undefined, 10);
      var dd2 = new this.service.DynamicDirective(truefn, 'dir2', undefined, 1);
      var dd3 = new this.service.DynamicDirective(truefn, 'dir3', undefined, 5);
      this.service.addInjection(ap, dd1);
      this.service.addInjection(ap, dd2);
      var html = '<div dynamic-directive="'+ap+'"><div>I exist</div><span>Me too</span></div>';
      var elt = this.$compile(html)(this.scope);
      this.$rootScope.$digest();
      this.service.addInjection(ap, dd3);
      this.$rootScope.$digest();
      expect(elt.children()).to.have.length(5);
      expect(elt.children().eq(4).hasClass('dir2')).to.be.true;
      expect(elt.children().eq(3).hasClass('dir3')).to.be.true;
      expect(elt.children().eq(2).prop('tagName')).to.equal('DIR1');
    });

  });

});
