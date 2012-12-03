(function() {
  var addAttributes = function(obj, suite, reservedAttributes) {
    var heirarchy = [];
    (function(currentSuite, heirarchy) {
      while (currentSuite) {
        heirarchy.unshift(currentSuite);
        currentSuite = currentSuite.parentSuite;
      }
    })(suite, heirarchy);
    heirarchy.unshift(jasmine.rootSuiteInstance);

    var prototypes = {};
    (function(prototypes) {
      for (var i=0; i < heirarchy.length; i++) {
        jasmine.util.extend(prototypes, heirarchy[i].prototype);
      }
      for (var i in prototypes) {
        if (prototypes.hasOwnProperty(i)) {
          if (reservedAttributes[i]) {
            throw "Cannot override attribute " + i + " because it is used by jasmine";
          }
        }
      }
    })(prototypes);

    jasmine.util.extend(obj, prototypes);
  };

  var oldSuite = jasmine.Suite;
  jasmine.Suite = function() {
    this.prototype = {};
    oldSuite.apply(this, arguments);
    addAttributes(this.prototype, this, {});
  };
  jasmine.Suite.prototype = oldSuite.prototype;
  jasmine.rootSuiteInstance = {
    prototype: {}
  };

  var addBeforesAndAftersToQueue = jasmine.Spec.prototype.addBeforesAndAftersToQueue;
  jasmine.Spec.prototype.addBeforesAndAftersToQueue = function() {
    addBeforesAndAftersToQueue.apply(this, arguments);
    var specReservedAttributes = {};
    (function(specReservedAttributes) {
      for (var i in this) {
        if (this.hasOwnProperty(i)) {
          specReservedAttributes[i] = true;
        }
      }
    }).call(this, specReservedAttributes);
    this.queue.addBefore(new jasmine.Block(this.env, function() {
      addAttributes(this, this.suite, specReservedAttributes);
    }, this));
  };
})();
