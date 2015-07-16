// Log to console
QUnit.moduleStart = function (o) {
	console.info("Module:", o.name); 
} 

QUnit.log = function (o) {
	console.info(o.result, o.message); //{ result, actual, expected, message }
}

QUnit.done = function (o) {
	console.info( "Qunit tests complete.", "Failed:", o.failed, "Passed:", o.passed, "Runtime:", o.runtime);
}

/* spawn tests */
module("Game 7x6", {
	setup: function() {
		this.game = new CONNECTFOUR.Game("7x6");
	},
	teardown: function () {
		this.game.destroy();
	}
});
test("spawn", 5, function() {
	ok(this.game, "exists");
	ok(typeof this.game === "object", "is object");
	ok(this.game.spawn, "this.spawn === true");
	ok(this.game.destroy, "destroy exists");
	ok(this.game.integrity && typeof this.game.integrity === "object", "integrity tests exist");
});
test("isPlayer", function() {
	ok(this.game.integrity.isPlayer && typeof this.game.integrity.isPlayer === "function", "isPlayer test exists");
	ok(this.game.integrity.isPlayer(0), "player 0");
	ok(this.game.integrity.isPlayer(1), "player 1");
	ok(!this.game.integrity.isPlayer(3), "3rd player");
	ok(!this.game.integrity.isPlayer(-1), "negative player");
});
test("isCoordinatePair", function() {
	ok(this.game.integrity.isCoordinatePair && typeof this.game.integrity.isCoordinatePair === "function", "isCoordinatePair test exists");
	ok(!this.game.integrity.isCoordinatePair(0), "wrong type");
	ok(!this.game.integrity.isCoordinatePair([1]), "too few coords");
	ok(!this.game.integrity.isCoordinatePair([1,2,3]), "too many coords");
	ok(!this.game.integrity.isCoordinatePair([null, 1]), "nulls not allowed");
	ok(this.game.integrity.isCoordinatePair([null, 1], true), "nulls  allowed");
});
// ...etc 


// different size tests 
module("Game 8x7", {
	setup: function() {
		this.game = new CONNECTFOUR.Game("8x7");
	},
	teardown: function () {
		this.game.destroy();
	}
});
test("spawn", 5, function() {
	ok(this.game, "exists");
	ok(typeof this.game === "object", "is object");
	ok(this.game.spawn, "this.spawn === true");
	ok(this.game.destroy, "destroy exists");
	ok(this.game.integrity && typeof this.game.integrity === "object", "integrity tests exist");
});

module("Game 9x7", {
	setup: function() {
		this.game = new CONNECTFOUR.Game("9x7");
	},
	teardown: function () {
		this.game.destroy();
	}
});
test("spawn", 5, function() {
	ok(this.game, "exists");
	ok(typeof this.game === "object", "is object");
	ok(this.game.spawn, "this.spawn === true");
	ok(this.game.destroy, "destroy exists");
	ok(this.game.integrity && typeof this.game.integrity === "object", "integrity tests exist");
});

module("Game 10x7", {
	setup: function() {
		this.game = new CONNECTFOUR.Game("10x7");
	},
	teardown: function () {
		this.game.destroy();
	}
});
test("spawn", 5, function() {
	ok(this.game, "exists");
	ok(typeof this.game === "object", "is object");
	ok(this.game.spawn, "this.spawn === true");
	ok(this.game.destroy, "destroy exists");
	ok(this.game.integrity && typeof this.game.integrity === "object", "integrity tests exist");
});

//  these should fail 
module("Game 9999x999", {
  setup: function() {
 		this.game = new CONNECTFOUR.Game("9999x999");
 	},
 	teardown: function () {
		if (this.game && this.game.destroy) {
			this.game.destroy();
		}
 	}
});
test("spawn", 1, function() {
	ok(!this.game.spawn, "did not spawn");
});


module("Game 99xasdf", {
  setup: function() {
 		this.game = new CONNECTFOUR.Game("99xasdf");
 	},
 	teardown: function () {
		if (this.game && this.game.destroy) {
			this.game.destroy();
		}
 	}
});
test("spawn", 1, function() {
	ok(!this.game.spawn, "did not spawn");
});

module("Game asdfx99", {
  setup: function() {
 		this.game = new CONNECTFOUR.Game("asdfx99");
 	},
 	teardown: function () {
		if (this.game && this.game.destroy) {
			this.game.destroy();
		}
 	}
});
test("spawn", 1, function() {
	ok(!this.game.spawn, "did not spawn");
});

module("Game asdfxasdf", {
  setup: function() {
 		this.game = new CONNECTFOUR.Game("asdfxasdf");
 	},
 	teardown: function () {
		if (this.game && this.game.destroy) {
			this.game.destroy();
		}
 	}
});
test("spawn", 1, function() {
	ok(!this.game.spawn, "did not spawn");
});

module("Game {}", {
  setup: function() {
 		this.game = new CONNECTFOUR.Game({});
 	},
 	teardown: function () {
		if (this.game && this.game.destroy) {
			this.game.destroy();
		}
 	}
});
test("spawn", 1, function() {
	ok(!this.game.spawn, "did not spawn");
});

module("Game new Number()", {
  setup: function() {
 		this.game = new CONNECTFOUR.Game(new Number());
 	},
 	teardown: function () {
		if (this.game && this.game.destroy) {
			this.game.destroy();
		}
 	}
});
test("spawn", 1, function() {
	ok(!this.game.spawn, "did not spawn");
});