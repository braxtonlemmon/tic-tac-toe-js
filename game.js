/*
	================
	PLAYER factory
	================
*/
const Player = (name, piece, id) => {
	let score = 0;
	let turn = 0;

	return { name, piece, score, turn, id };
};


/*
	================
	GAMEBOARD module
	================
*/
const Gameboard = (function() {
	let gameboard = Array(9).fill('');

	const isFull = function() {
		return this.gameboard.every(spot => spot != '');
	};

	const spotEmpty = function(input) {
		const key = 
			typeof(input) === 'object' ? input.target.dataset.key : input;
		const div = document.querySelector(`.spot[data-key="${key}"]`);
		return div.innerHTML.trim().length < 1;
	}

	const makeSpotsClickable = function() {
		const spots = document.querySelectorAll('.spot');
		spots.forEach(spot => {
			spot.addEventListener('click', (e) => {
				if (spotEmpty(e) && !Robot.turn) {
					Display.addPieceToBoard(e);
					if (Game.robot && !Robot.turn) {
						Robot.turn = true;
						setTimeout(Robot.move, 1500);
					}
				}
			})
		})
	};

	const reset = function() {
		this.gameboard = Array(9).fill('');
	};

	return { 
		gameboard, 
		isFull, 
		spotEmpty, 
		makeSpotsClickable, 
		reset 
	};
})();

/*
	==============
	GAME module
	==============
*/
const Game = (() => {
	let players = [Player('', 'x', 1), Player('', 'o', 2)];
	let current = {};
	let robot = false;

	const _winningMoves = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
		[1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
	];

	// Sets up and initiates the game
	const start = function() {
		const player = document.querySelector('.player1');
		const robot = document.getElementById('robot');
		
		if (robot.checked) this.robot = true;
		player.classList.toggle('current');
		Display.updateNames();
		Display.updateScores();
		Gameboard.makeSpotsClickable();
		Game.players[0].turn = 1;
		Game.current = players[0];
	};

	const swapPlayers = function() {
		_swapPlayerObjects();
		Display.swapCurrent();
	};

	const endGame = function() {
		if (_checkForWin()) {
			Game.current.score++;
			Display.showBox('win');
			return true;	
		} else if (Gameboard.isFull()) {
			Display.showBox('tie');
			return true;
		}
	}

	const reset = function() {
		Game.players.forEach(player => {
			player.score = 0;
		});
		Gameboard.reset();
		Display.clearBoard();
		Display.showBox('form');
		Game.robot = false;
		Robot.turn = false;
	}

	const rematch = function() {
		Gameboard.reset();
		Display.clearBoard();
		Game.players[0].turn = 1;
		Game.players[1].turn = 0;
		Game.current = Game.players[0];
		const player = document.querySelector('.player1');
		player.classList.toggle('current');
		Display.updateScores();
		Robot.turn = false;
	}

	/* PRIVATE */

	const _swapPlayerObjects = function () {
		[Game.players[0].turn, Game.players[1].turn] = players[0].turn ? [0, 1] : [1, 0];
		Game.current = players[0].turn ? players[0] : players[1];
	};

	// Checks for a winning combo on board
	const _checkForWin = function () {
		let win = false;
		_winningMoves.forEach(line => {
			let boardLine = [];
			line.forEach(spot => boardLine.push(Gameboard.gameboard[spot]));
			if (boardLine.every(spot => (spot === boardLine[0]) && (spot != ''))) win = true;
		});
		return win;
	};

	return { 
		players,  
		current, 
		robot,
		start,
		swapPlayers,
		endGame,
		reset, 
		rematch,
	 };
})();

/*
	==============
	DISPLAY module
	==============
*/


const Display = (function () {
	const playerDivs = document.querySelectorAll('.player');

	const addPieceToBoard = function(e) {
		const key = 
			typeof(e) === 'object' ? e.target.dataset.key : e;
		const div = document.querySelector(`.spot[data-key="${key}"]`);
		if (Gameboard.spotEmpty(e)) {
			div.textContent = Game.current.piece;
			Gameboard.gameboard[key] = Game.current.piece;
			Game.endGame() ? (Robot.turn = true) : Game.swapPlayers();
		}
	};

	const updateNames = function() {
		for (let i = 1; i < 3; i++) {
			const player = document.querySelector(`.player${i}-name`);
			const name = document.getElementById(`player${i}`).value;
			player.textContent = `${name} (${Game.players[i - 1].piece})`;
			Game.players[i - 1].name = name;
		}
	};

	const updateScores = function() {
		for (let i = 1; i < 3; i++) {
			const player = document.querySelector(`.player${i}`);
			player.lastElementChild.textContent = Game.players[i - 1].score;
		}
	};

	// Manually toggle between pop-up and game displays
	const gameDisplay = function(mode) {
		const mainDivs = document.querySelectorAll('.main');
		const box = document.querySelector('.box');
		if (mode === 'box') {
			mainDivs.forEach(div => div.classList.remove('full'));
			box.classList.remove('hidden');
		} else if (mode === 'game') {
				mainDivs.forEach(div => div.classList.add('full'));
				box.classList.add('hidden');
		}
	}

	// Dynamically fill in content of pop-up box
	const showBox = function(type) {
		gameDisplay('box');
		const box = document.querySelector('.box');
		let content = document.createElement('div');

		while (box.firstChild) {
			box.removeChild(box.firstChild);
		}

		if (type === 'form') {
			content.classList.add('start-form');
			content.innerHTML = `
				<form class="start-form">
					<label>Player 1</label>
					<input type="text" class="name-input" id="player1" placeholder="Name">
					<label>Player 2</label>
					<input type="text" class="name-input" id="player2" placeholder="Name">
					<div class="computer-check">
						<label>Player 2 is a computer?</label>
						<input type="checkbox" id="robot">
					</div>
				</form>
				<button class="button start-button">START</button>
			`;
		} 
		else if (type === 'win') {
			console.log('yeswin');	
				content.innerHTML = `
					<p>${Game.current.name} is the winner!</p>
					<button class="button rematch-button">REMATCH</button>
					<button class="button reset-button">NEW GAME</button>
				`
		} 
		else if (type === 'tie') {
			console.log('tie');
				content.innerHTML = `
					<p>Game is a tie...</p>
					<button class="button rematch-button">REMATCH</button>
					<button class="button reset-button">NEW GAME</button>
				`;
		}	

		box.appendChild(content);
		if (type === 'form') _startButton();
		if (type ==='win' || type === 'tie') {
			resetButton();
			_rematchButton();
		}
	};

	const resetButton = function(e) {
		const reset = document.querySelector('.reset-button');
		reset.addEventListener('click', (e) => {
			gameDisplay('box');
			Game.reset();
		});
	};

	// Toggles current class to highlight playeron scoreboard
	const swapCurrent = function () {
		playerDivs.forEach(player => player.classList.toggle('current'));
	}

	const clearBoard = function () {
		const board = document.querySelectorAll('.spot');
		const players = document.querySelectorAll('.player');
		board.forEach(spot => spot.textContent = '');
		players.forEach(player => player.classList.remove('current'));
	}

	/* =============== PRIVATE =============== */

	const _startButton = function(e) {
		const start = document.querySelector('.start-button');
		start.addEventListener('click', (e) => {
			gameDisplay('game');
			Game.start();
		})
	};

	const _rematchButton = function(e) {
		const rematch = document.querySelector('.rematch-button');
		rematch.addEventListener('click', (e) => {
			gameDisplay('game');
			Game.rematch();
		})
	}

	return { 
		addPieceToBoard, 
		updateNames,
		updateScores, 
		gameDisplay,
		showBox, 
		resetButton,
		swapCurrent, 
		clearBoard,
	}
})();

/*
	=============
	A.I. MODULE
	=============
*/

const Robot = (function() {
	let turn = false;

	const move = function() {
		const random = () => { return Math.floor(Math.random() * 9) };
		let spotNumber = random();
		while (Gameboard.gameboard[spotNumber] != '') {
			spotNumber = random();
		};
		Display.addPieceToBoard(spotNumber);
		Robot.turn = false;
	}
	
	return {
		 turn,
		 move,
	 };
})();


// Script executed upon page load
Display.gameDisplay('box');
Display.showBox('form');
Display.resetButton();
