describe("jqueryFixedToParent positioning", function() {
  var pending = function(){ expect(true).toBe(false); console.log("Test pending!"); };

  describe("when scrolling down", function() {
    describe("from above the start-waypoint", function() {
      it("should be static", function() {
        pending();
      });
    });

    describe("to below the start-waypoint (within the fixed-parent-region)", function() {
      it("should be fixed to the top of the viewport", function() {
        pending();
      });
    });
  });

  describe("when scrolling up", function() {
    describe("from below the end-waypoint", function() {
      it("should be static", function() {
        pending();
      });
    });
    describe("to above the end-waypoint (within the fixed-parent-region)", function() {
      it("should be fixed to the bottom of the viewport", function() {
        pending();
      });
    });
  });

});