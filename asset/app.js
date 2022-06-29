$(function () {
	var difi; //độ khó
	var n; // hàng-cột
	var bombNum; //số bom tổng
	var flagNum; //số cờ tổng
	var map = []; //mảng lưu trị số
	var filter = [];
	let bombList = []; //mảng lưu vị trí bom
	var flagList = []; //mảng lưu vị trí flag
	var flagRemain; //số cờ còn lại
	var status;
	var firstClick = 1; //biến để check lần đầu bấm vào map => lấy timeStart
	//var tính highscore
	var timeStart = 0;
	var setintervalTemp;
	var point = 0;

	loadPage();

	//ngăn click chuột phải
	$("#play-ground").contextmenu(function () {
		return false;
	});

	//bấm R để restart
	$(document).on("keyup", function (event) {
		var code = event.code;
		if (code === "KeyR") loadPage();
	});

	//chuyển mode
	$("#mode").on("change", function (event) {
		gameOver();
		// status = "lose";
		firstClick = 1;
		devide();
		loadPage();
	});

	// console.log(point);

	function loadPage() {
		mode();
		makeBombs();
		reachable();
		render(filter);
		//số cờ hiện có
		$("#flagremain").empty();
		$("#flagremain").append(`Flags: ${flagRemain}`);
		//khi click vào 1 ô ngẫu nhiên
		$(".tile").mousedown(function (e) {
			var temp = $(this).attr("id"); //lấy id của ô được nhấn
			//tính giờ nếu đây là lần đầu tiên 1 ô đc nhấn
			if (firstClick) {
				gameStart();
				firstClick = 0;
			}
			//restart nếu nhấn bằng chuột giữa
			if (e.which === 2) {
				firstClick = 1;
				gameOver();
				status = "ongoing";
				devide();
				loadPage();
			}
			//chuột phải đặt cờ
			if (e.which === 3) {
				e.preventDefault();
				if ($(this).hasClass("hidden") && flagNum < bombNum) {
					$(this).removeClass("hidden");
					$(this).addClass("flag");
					flagList.push(temp);
					flagNum++;
				} else if ($(this).hasClass("flag")) {
					$(this).removeClass("flag");
					$(this).addClass("hidden");
					flagList.splice(flagList.indexOf(temp), 1);
					flagNum--;
				}
				flagRemain = bombNum - flagNum;
				$("#flagremain").empty();
				$("#flagremain").append(`Flags: ${flagRemain}`);
				flagList.sort(function (a, b) {
					return a - b;
				});
			}
			//chuột trái mở ô
			else if (e.which === 1) {
				if (status == "win" || status == "lose") {
					firstClick = 1;
					gameOver();
					status = "ongoing";
					devide();
					return loadPage();
				}
				if (isMine(temp) && status != "lose" && !$(this).hasClass("flag")) {
					//chuyển class
					$(this).removeClass("hidden");
					$(this).addClass("mine");

					status = "lose";
					revealAll();
					gameOver();
					console.log("You lose!");
					return alert(`Game over!`);
				} else reveal(temp);
			}

			if (isEqual(flagList, bombList)) {
				if (!$(".tile").hasClass("hidden")) {
					status = "win";
					returnPoint();
					// if (difi == "baby") {
					// 	console.log("alo");
					// 	return console.log(`Your point is: ${temp2}`);
					// }
					alert(`You win! Your time is: ${point}`);
					gameOver();
				}
			}
		});

		//chưa viết
		$(".tile").hover(
			function () {
				// over
				// $(this).removeClass("hidden");
				// $(this).addClass("yellow");
				// console.log($(this).attr("class"));
			},
			function () {
				// out
				// $(this).removeClass("yellow");
			}
		);
	}

	//lật tất cả ô
	function revealAll() {
		for (let index = 0; index < map.length; index++) {
			// $(`#${index}`).removeClass("flag");
			if (map[index] == 9) {
				if (!$(`#${index}`).hasClass("mine")) {
					if (!$(`#${index}`).hasClass("flag")) {
						$(`#${index}`).removeClass("hidden");
						$(`#${index}`).addClass("overlay-mine active");
					}
				}
			} else $(`#${index}`).addClass(`num-${map[index]}`);
			//add class border cho css
			if (
				!$(`#${index}`).hasClass("border-num") &&
				!$(`#${index}`).hasClass("overlay-mine") &&
				map[index] != 0
			)
				$(`#${index}`).addClass(`border-num`);
			reveal(index);
		}
	}

	//random vị trí bom
	function makeBombs() {
		bombList.length = 0;
		flagList.length = 0;
		flagNum = 0;
		flagRemain = bombNum - flagNum;
		var bomb;
		for (let i = 0; i < bombNum; i++) {
			bomb = getRandomInt(0, n * n);
			if (bombList.includes(bomb)) {
				i = i - 1;
			} else if (bomb < n * n) {
				bombList.push(bomb);
			}
		}
		bombList.sort(function (a, b) {
			return a - b;
		});
		console.log(`bomb: ${bombList}`);
		// console.log(`${bombList.length}`);
	}

	//random trong khoảng cho trước
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min);
	}

	//đếm số bom ở các hướng, tạo trị số
	function reachable() {
		for (let i = 0; i < map.length; i++) {
			var count = 0;
			if (isMine(i)) {
				map[i] = 9;
				continue;
			} else {
				bombList.forEach(function (e) {
					if (isTopLeftMine(i, e)) count++; //1
					if (isTopMine(i, e)) count++; //2
					if (isTopRightMine(i, e)) count++; //3
					if (isLeftMine(i, e)) count++; //4
					if (isRightMine(i, e)) count++; //6
					if (isBottomLeftMine(i, e)) count++; //7
					if (isBottomMine(i, e)) count++; //8
					if (isBottomRightMine(i, e)) count++; //9
				});
			}
			map[i] = count;
		}
	}

	function isZero(pos) {
		if (map[pos] == 0) return 1;
		else return 0;
	}

	function isMine(pos) {
		var temp = 0;
		bombList.forEach((element) => {
			if (element == pos) temp++;
		});
		if (temp == 0) return 0;
		else return 1;
	}

	//check các hướng xem liệu có bom ở hướng ấy?
	function isTopLeftMine(pos, e) {
		if (pos % n != 0 && map[pos - n - 1] && e == pos - n - 1) return 1;
		else return 0;
	}
	function isTopMine(pos, e) {
		if (map[pos - n] && e == pos - n) return 1;
		else return 0;
	}
	function isTopRightMine(pos, e) {
		if ((pos + 1) % n != 0 && map[pos - n + 1] && e == pos - n + 1) return 1;
		else return 0;
	}
	function isLeftMine(pos, e) {
		if (pos % n != 0 && map[pos - 1] && e == pos - 1) return 1;
		else return 0;
	}
	function isRightMine(pos, e) {
		if ((pos + 1) % n != 0 && e == pos + 1) return 1;
		else return 0;
	}
	function isBottomLeftMine(pos, e) {
		if (pos % n != 0 && e == pos + n - 1) return 1;
		else return 0;
	}
	function isBottomMine(pos, e) {
		if (e == pos + n) return 1;
		else return 0;
	}
	function isBottomRightMine(pos, e) {
		if ((pos + 1) % n != 0 && e == pos + n + 1) return 1;
		else return 0;
	}

	//ren map
	function render(array) {
		$("#box-table").empty();
		var filterClass = "";
		if (array == map) {
		}
		if (array == filter) {
			filterClass = "hidden";
		}

		for (let i = 0; i <= n * n - n; i += n) {
			for (let j = i; j < i + n; j++) {
				if (array[j] == 9) {
					$("#box-table").append(
						`<button id="${j}" id="${j}" class="tile ${filterClass} mine "></button>`
					);
					continue;
				}
				if (array[j] == 0) {
					$("#box-table").append(
						`<button id="${j}" class="tile ${filterClass} num-0 border-num smaller"></button>`
					);
					continue;
				}
				if (array[j] == 10) {
					$("#box-table").append(
						`<button id="${j}" class="tile ${filterClass}"></button>`
					);
					continue;
				} else {
					$("#box-table").append(
						`<button id="${j}" class="tile ${filterClass} num-${
							i - -j
						} border-num smaller"></button>`
					);
				}
			}
		}
	}

	//ss 2 array
	function isEqual(a, b) {
		return a.join() == b.join();
	}

	//
	function reveal(pos) {
		//pos==id
		if ($(`#${pos}`).hasClass("hidden")) {
			$(`#${pos}`).removeClass("hidden");
			//kiểm tra ô được bấm là 0?
			//hiện 8 ô xung quanh ô được bấm
			if (isZero(pos)) {
				$(`#${pos}`).addClass("num-0");
				revealAllNearbyZero(pos);
				return;
			}
			$(`#${pos}`).addClass(`num-${map[pos]} border-num`);
		}
	}

	function revealAllNearbyZero(pos) {
		var topleft = pos - n - 1;
		var topright = pos - n - -1;
		var left = pos - 1;
		var right = pos - -1;
		var bottomleft = pos - -n - 1;
		var bottomright = pos - -n - -1;
		var top = pos - n;
		var bottom = pos - -n;

		if (map[pos] == 0) {
			if (pos % n != 0) reveal(topleft);
			if ((pos - -1) % n != 0) reveal(topright);
			if (pos % n != 0) reveal(left);
			if ((pos - -1) % n != 0) reveal(right);
			if (pos % n != 0) reveal(bottomleft);
			if ((pos - -1) % n != 0) reveal(bottomright);
			reveal(top);
			reveal(bottom);
		}
	}

	//chọn độ khó, set trị số ban đầu của các ô trong map là 0
	function mode() {
		difi = $("#mode").val();
		switch (difi) {
			case "baby":
				n = 5;
				bombNum = 3;
				break;
			case "easy":
				// n = 3;
				// bombNum = 1;
				n = 10;
				bombNum = 11;
				break;
			case "medium":
				n = 17;
				bombNum = 40;
				break;
			case "hard":
				n = 20;
				bombNum = 50;
				break;
		}
		//set trị số map = 0
		for (let i = 0; i < n * n; i++) {
			map.push("0");
		}
		//set trị số filter = 10
		for (let i = 0; i < n * n; i++) {
			filter.push("10");
		}
		//chia dòng
		var wid = n * 32 - -8;
		$("#box-table").css("width", `${wid}`);
		$("#tuto").css("width", `${wid}`);
	}

	//hàm tính highscore dựa theo thời gian chơi
	function gameStart() {
		timeStart = parseInt(new Date().getTime());
		setintervalTemp = setInterval(returnPoint, 1000);
	}
	function gameOver() {
		clearInterval(setintervalTemp);
		timeStart = 0;
		point = 0;
	}
	function returnPoint() {
		var d = parseInt(new Date().getTime());
		point = d - timeStart;
		if (point >= 999000) {
			status = "lose";
			revealAll();
			gameOver();
			console.log("You lose!");
			return alert(`Game over!`);
		}
		if (status == "win") console.log(`Real score: ${point}`);
		devide();
	}
	//tách point ra để hiển thị thành 3 thành phần
	var hundred;
	var decimal;
	var unit;

	function devide() {
		hundred = 0;
		decimal = 0;
		unit = 0;
		point = parseInt(point / 1000);

		unit = point % 10;
		decimal = ((point % 100) - unit) / 10;
		hundred = (point - (point % 100)) / 100;
		$("#hundred")
			.removeAttr("class")
			.addClass(`clock-num-${hundred} clock-style`);
		$("#decimal")
			.removeAttr("class")
			.addClass(`clock-num-${decimal} clock-style`);
		$("#unit").removeAttr("class").addClass(`clock-num-${unit} clock-style`);
	}
});
