/*
	Pre-coding brainstorming:
	
	Objects needed and where they will be stored:

		Modules (only need one instance of...):
			gameboard
			displayController

		Factories (need multiple instances of...):
			player
*/

/*
	================
	PLAYER factory
	================
*/
const Player = (name, piece) => {
	let score = 0;
	let turn = 0;
	return { name, piece, score, turn };
};


/*
	================
	GAMEBOARD module
	================
*/
const Gameboard = (function () {
	// Holds the values of each gameboard spot in an array
	let gameboard = Array(9).fill('');
	
	// Checks to see if board is full
	function isFull() {
		return Gameboard.gameboard.every(spot => spot != '') ? true : false;
	}

	// Checks to see if spot on HTML board is empty
	function spotEmpty(selector) {
		return selector.innerHTML.trim().length < 1;
	}

	return { gameboard, isFull, spotEmpty };
})();

/*
	==============
	DISPLAY module
	==============
*/
const Display = (function () {
	// Takes gameboard values and transfers to HTML gameboard grid
	function gameboardToHTML() {
		for (let i = 0; i < Gameboard.gameboard.length; i++) {
			const div = document.querySelector(`.spot[data-key="${i}"]`);
			const span = document.createElement('span');
			span.textContent = Gameboard.gameboard[i];
			div.appendChild(span);
		}
	};

	// Updates individual DOM element with 'x' 
	function addPieceToBoard(e) {
		const key = e.target.dataset.key;
		const div = document.querySelector(`.spot[data-key="${key}"]`);
		if (Gameboard.spotEmpty(div)) {
			const current = Game.swapCurrentPlayer();
			div.textContent = current.piece;
			Gameboard.gameboard[key] = current.piece;
		} 
		

	}

	// Setup names on board 
	function updateNames() {
		for (let i = 1; i < 3; i++) {
			const player = document.querySelector(`.player${i}-name`);
			const name = document.getElementById(`player${i}`).value;
			player.textContent = name;
		}
	}

	// Updates player scores
	function updateScores() {
		for (let i = 1; i < 3; i++) {
			const player = document.querySelector(`.player${i}`);
			player.lastElementChild.textContent = Game.players[i - 1].score;
		};
	}

	return { gameboardToHTML, addPieceToBoard, updateScores, updateNames }
})();




/*
	==============
	GAME module
	==============
*/


const Game = (function () {
	const players = [Player('Braxton', 'x'), Player('Dani', 'o')];

	// Winning combo possibilities held in array 
	const winningMoves = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
		[1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
	];

	// Sets up and initiates the game
	function start() {
		Display.updateNames();
		Display.updateScores();
	}

	// Checks for a winning combo on board
	function checkForWin() {
		let win = false;
		winningMoves.forEach(line => {
			let boardLine = [];
			line.forEach(spot => boardLine.push(Gameboard.gameboard[spot]));
			if (boardLine.every(spot => (spot === boardLine[0]) && (spot != ''))) win = true;
		});
		return win;
	};

	// Checks for tie
	function checkForTie() {
		return Gameboard.isFull() && !checkForWin() ? true : false;
	}

	// Returns current player
	function swapCurrentPlayer() {
		if (players[0].turn) {
			players[0].turn = 0;
			players[1].turn = 1;
		} else {
			players[0].turn = 1;
			players[1].turn = 0;
		}
		return players[0].turn ? players[0] : players[1];
	}

	return { checkForWin, checkForTie, start, players, swapCurrentPlayer };
})();




/* 
	==================
	EVENTS
	==================
*/
// Event handler for spots on board
const spots = document.querySelectorAll('.spot');
spots.forEach(spot => {
	spot.addEventListener('click', Display.addPieceToBoard);
});

// Event handler for start game button
const start = document.querySelector('.start-button');
start.addEventListener('click', (e) => {
	const startDiv = document.querySelector('.start');
	startDiv.style.visibility = 'hidden';
	const mainDivs = document.querySelectorAll('.main');
	mainDivs.forEach(div => div.style.opacity = 1);
	Game.start();
})


