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
	GAMEBOARD module
	================
*/
const Gameboard = (function () {
	// Holds the values of each gameboard spot in an array
	let gameboard = ['x', 'x', 'x', 'o', 'x', 'x', 'x', 'x', 'x'];

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
		if (Gameboard.spotEmpty(div)) div.textContent = 'x';
	}

	// Updates player scores
	function updateScores() {
		for (let i = 1; i < 3; i++) {
			const player = document.querySelector(`.player${i}`);
			player.lastElementChild.textContent = players[i - 1].score;
		};
	}


	return { gameboardToHTML, addPieceToBoard, updateScores }
})();

/*
	==============
	GAME module
	==============
*/
const Game = (function () {
	let _currentPlayer;

	/*
	0, 1, 2
	3, 4, 5
	6, 7, 8
	0, 3, 6
	1, 4, 7
	2, 5, 8
	0, 4, 8
	2, 4, 6

	*/
})();

/*
	================
	PLAYER factory
	================
*/
const Player = (name, piece) => {
	let score = 0;
	return { name, piece, score };
};



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
})





// Game execution
const players = [Player('Braxton', 'x'), Player('Dani', 'o')];