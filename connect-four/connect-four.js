var CONNECTFOUR = CONNECTFOUR || {}; // create an app "namespace"
CONNECTFOUR.Game = function (dimensionStr) { // game constructor  

		var integrity = { // value checking
			"isDimensionStr" : function (dimensionStr) {
				if (!dimensionStr ||
						typeof dimensionStr !== "string" ||
						dimensionStr.indexOf("x") === -1 ||
						!/^[0-9]{1,2}x[0-9]{1,2}$/.test(dimensionStr)) { return false; }
				return true;
			},
			"isSingleCoordinate" : function (value, max, allowNull) {
				var bool = (typeof value === "number" &&
										value >= 0 &&
										((max) ? (value < max) : true) ); // max optional
				return (allowNull) ? (bool || value === null) : bool; // allowNull==false implied
			},
			"isCoordinatePair" : function (value, allowNull) {
				return (
					typeof value === "object" && 
					value.constructor.toString().indexOf("Array") !== -1 &&
					value.length === 2 && 
					this.isSingleCoordinate(value[0], rows, allowNull) &&
					this.isSingleCoordinate(value[1], cols, allowNull)
				) ? true : false;
			},
			"isFunction" : function (value, allowFalsy) {
				var bool = (typeof value === "function");										
				return (allowFalsy) ? (bool || !value) : bool;
			},
			"isBoundry" : function (value, allowNull) {
				var bool = (value === rows-1 || value === cols-1 || value === 0);
				return (allowNull) ? (bool || value === null) : bool;
			},
			"isPlayer" : function (value) {
				return (value === 0 || value === 1);
			}			
		};

		if (!integrity.isDimensionStr(dimensionStr)) {
			return { "spawn" : false };
		}

		var gameover = false, 
				player = 0,
				moves = 0,
				win = 4,
				dimension = dimensionStr.split("x"),
				rows = parseInt(dimension[1], 10),
				cols = parseInt(dimension[0], 10),
				fullCols = 0;

		if ((typeof rows !== "number" && rows > 0) ||
				(typeof cols !== "number" && cols > 0)) {
			return false;
		}
		
		// string constants
		var STR_SELECT = ", select a column",
				STR_WIN = " wins!!!",
				STR_ERR = "invalid move. Please try another column.",
				STR_PLAYER = "Player ",
				STR_ONE = "One",
				STR_TWO = "Two",
				STR_NOWIN = "Cat's game: nobody won.";

		var state = [];
		var i = cols-1; // save state of game in array of arrays
		do {
			state[i] = [];
		} while (i--);

		var switchPlayer = function () {
			return (player === 0) ? 1 : 0;
		};
		
		
		// win test vector obj creator
		function Xy (start) {
			this.connected = 1;
			this.player = player;
			this.state = state;	
			this.win = win;
			this.start = start;
		}
		Xy.prototype = { 
		
			util : {
				"add" : function (n) { return n+1; },
				"subtract" : function (n) { return n-1; }
			},

			coordinateStep : function (c, s, b) {
				if (!integrity.isSingleCoordinate(c) ||
						!integrity.isFunction(s, true) ||
						!integrity.isBoundry(b, true)) {
					return false;
				}
				if (typeof s === "function" && 
						typeof b === "number") { // null is no-op
						if (b === 0 && c > b) { //low bound
							return s(c);
						} else if (b > 0 && c < b) { // high bound
							return s(c);
						}
						return null;
				}	else {
					return c;
				}
			},

			getNextFn : function (step, boundry) { // return a function to determine next slot to check
				if (!integrity.isCoordinatePair(boundry, true)) {
					return false;
				}
				return function (cursor) {
					if (!integrity.isCoordinatePair(cursor)) {
						return false;
					}
					var next, x, y;
					y = this.coordinateStep(cursor[0], this.util[step[0]], boundry[0], rows);
					x = this.coordinateStep(cursor[1], this.util[step[1]], boundry[1], cols);
					if (typeof x === "number" &&
							typeof y === "number") {
						next = [y, x];
					}
					return next;
				};
			},

			check : function (player) {
				if (integrity.isPlayer(player)) {
					this.player = player;
				}
				if (typeof this.forward === "function") {
					if (this.walk(this.start, this.forward)) {
						return true;
					}
				}
				if (typeof this.backward === "function") {
					if (this.walk(this.start, this.backward)) {
						return true;
					}
				}
				return false;
			},
	
			walk : function (cursor, fn) {
				cursor = fn.call(this, cursor);
				while (cursor) { // cursor val defined
					if (this.state[cursor[1]][cursor[0]] === this.player) { // check cursor coordinates to owner
						this.connected++;
						if (this.connected >= this.win) {
							return true; // win!
						}
						cursor = fn.call(this, cursor); // check next cursor coords
					} else {
						return false;
					}					
				}
				return false;
			},

			setForward :  function (step, boundry) {
				this.forward = this.getNextFn(step, boundry);
			},

			setBackward :  function (step, boundry) {
				this.backward = this.getNextFn(step, boundry);
			}
		
		};

		var checkWin = function (row, col) {

			if (moves < (win*2)-1) {
				return false; // minimum moves to win
			} 

			if (!integrity.isCoordinatePair([row, col])) {
				return false;
			}

			var vertical = new Xy([row, col]); // check on vertical plane, only need to check backwards
			vertical.setBackward(["subtract", null], [0, null]);
			if (vertical.check(player)) {
				return true;
			}

			var horizontal = new Xy([row, col]); // check on horizonal plane [y, x]
			horizontal.setForward([null, "add"], [null, cols-1]);
			horizontal.setBackward([null, "subtract"], [null, 0]);
			if (horizontal.check(player)) {
				return true;
			}

			var positiveSlope = new Xy([row, col]); // check +rise
			positiveSlope.setForward(["add", "add"], [rows-1, cols-1]);
			positiveSlope.setBackward(["subtract", "subtract"], [0, 0]);
			if (positiveSlope.check(player)) {
				return true;
			}

			var negativeSlope = new Xy([row, col]); // check -rise
			negativeSlope.setForward(["subtract", "add"], [0, cols-1]);
			negativeSlope.setBackward(["add", "subtract"], [rows-1, 0]);
			if (negativeSlope.check(player)) {
				return true;
			}

			return false;

		};
		
		var checkFull = function () {
			if (fullCols === cols) {
				return true;
			}
			return false;			
		};

		var updateBoard = function (row, col) {
			var token = document.createElement("div"),
					name = " player-" + player;
			ui.gridMap[row][col].appendChild(token);
			token.className = "token";

			window.setTimeout( function () {
				token.className += name;
			}, 0); // forces anim
			
			if (row === rows-1) {
				ui.buttonEls[col].className = ""; // hide arrows if full
			}
		};
		
		var updateCaption = function (str) {
			ui.captionEl.className = "player-" + player;
			ui.captionEl.innerHTML = STR_PLAYER +
				((player === 0) ? STR_ONE : STR_TWO) +
				str;		
		};

		var endGame = function () {
			gameover = true;
			ui.gridEl.className = "gameover";
		};
		
		var drop = function (selection) {

			selection = parseInt(selection, 10);

			if (!integrity.isSingleCoordinate(selection, cols) ||
					(!selection && selection !== 0)) {
				return false;
			}
			
			var col = state[selection],
					row;
			if (col.length < rows) { // check if stack is full
				col.push(player);
				moves++;
//				console.log("### MOVE:", moves);
				if (col.length === rows) {
					fullCols++;
				}
				row = col.length-1;
				updateBoard(row, selection);
				if (checkWin(row, selection)) {
					endGame();
					updateCaption(STR_WIN);
				} else if (checkFull()) {
					endGame();
					ui.captionEl.innerHTML = STR_NOWIN;
				} else { 
					player = switchPlayer();
					updateCaption(""); 
				}
			} else {
				updateCaption(STR_ERR);
			}
		};

		var registerClick = function (e) {
			if (e.target.nodeName === "BUTTON" && !gameover) {
				drop(e.target.innerHTML);
			}
		};

		var drawUI = function () { // show in DOM
			var grid = document.createElement("table"),
					root = document.getElementById("connect-four"),
					theadStr = "",
					tbodyStr = "",
					gridMap = [],
					rowEls,
					i, j;
			for (i=0; i<rows; i++) {
				tbodyStr += "<tr>";
				for (j=0; j<cols; j++) {
					if (i === 0) { // create header on first pass only
						theadStr += "<th attr=\"" + j + "\"><button type=\"button\" class=\"active\">" + j + "</button></th>";
					}
					tbodyStr += "<td></td>";
				}
				tbodyStr += "</tr>";
			}
			grid.innerHTML = "<caption>" +
				STR_PLAYER +
				STR_ONE +
				STR_SELECT +
				"</caption><thead><tr>" +
				theadStr +
				"</tr><thead><tbody>" +
				tbodyStr +
				"</tbody>";
			root.insertBefore(grid, root.firstChild.nextSibling.nextSibling.nextSibling.nextSibling);
			grid.addEventListener("click", registerClick, true);
			rowEls = grid.getElementsByTagName("tr");
			i = rowEls.length-1;
			do {
				if (i > 0) {
					gridMap.push(rowEls[i].getElementsByTagName("td"));
				}				
			} while (i--);
			return {
				"gridMap" : gridMap,
				"captionEl" : grid.getElementsByTagName("caption")[0],
				"gridEl" : grid,
				"buttonEls" : grid.getElementsByTagName("button")
			};
		};
		
		var ui = drawUI();
		
		// Public 
		this.destroy = function () {
			ui.gridEl.removeEventListener("click", registerClick, true);
			ui.gridEl.parentNode.removeChild(ui.gridEl);
		};
		this.integrity = integrity; // expose to unit testing
		this.spawn = true;
		return this;
};

document.addEventListener("DOMContentLoaded", function () {
	var el = document.getElementsByTagName("ul")[0];
	el.addEventListener("click", function (e) {
		new CONNECTFOUR.Game(e.target.innerHTML);
	}, true);
}, false);