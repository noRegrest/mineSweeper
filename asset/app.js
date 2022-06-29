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

	$("#dif").on("change", function (event) {
		loadPage();
	});

	function loadPage() {
		dif();
		makeBombs();
		reachable();
		render(filter);
		$("#flagremain").empty();
		$("#flagremain").append(`Flags: ${flagRemain}`);
		console.log(`${flagRemain}`);

		$(".tile").mousedown(function (e) {
			var temp = $(this).attr("id");
			if (e.which === 2) {
				alert("Restart!");
				loadPage();
			}
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
			} else if (e.which === 1 && !$(this).hasClass("flag")) {
				if (
					isMine(temp) &&
					!$(this).hasClass("active") &&
					!$(this).hasClass("mine")
				) {
					$(this).removeClass("hidden");
					$(this).addClass("mine");
					flagList.splice(flagList.indexOf(temp), 1);
					flagNum--;
					console.log(bombList);
					$("#bombremain").empty();
					$("#bombremain").append(`Bombs remain: ${bombNum - 1}`);
					revealAll();
					alert(`Game over!`);
				} else reveal(temp);
			}

			if (isEqual(flagList, bombList)) {
				if (!$(".tile").hasClass("hidden")) return alert("You win!");
			}
		});

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
				// $(this).addClass("hidden");
				// console.log($(this).attr("class"));
			}
		);
	}

	//lật tất cả ô
	function revealAll() {
		for (let index = 0; index < map.length; index++) {
			$(`#${index}`).removeClass("flag");
			if (map[index] == 9) {
				if (!$(`#${index}`).hasClass("mine")) {
					$(`#${index}`).removeClass("hidden");
					$(`#${index}`).addClass("overlay-mine active");
				}
			} else $(`#${index}`).addClass(`num-${map[index]}`);
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
		console.log(`${bombList.length}`);
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
			console.log("[map]");
		}
		if (array == filter) {
			console.log("[filter]");
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
			if (map[pos] == 1) $(`#${pos}`).addClass("num-1 border-num");
			if (map[pos] == 2) $(`#${pos}`).addClass("num-2 border-num");
			if (map[pos] == 3) $(`#${pos}`).addClass("num-3 border-num");
			if (map[pos] == 4) $(`#${pos}`).addClass("num-4 border-num");
			if (map[pos] == 5) $(`#${pos}`).addClass("num-5 border-num");
			if (map[pos] == 6) $(`#${pos}`).addClass("num-6 border-num");
			if (map[pos] == 7) $(`#${pos}`).addClass("num-7 border-num");
			if (map[pos] == 8) $(`#${pos}`).addClass("num-8 border-num");
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
	function dif() {
		difi = $("#dif").val();
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
		//set trị số map = 10
		for (let i = 0; i < n * n; i++) {
			filter.push("10");
		}
		//chia dòng
		var wid = n * 32 - -8;
		$("#box-table").css("width", `${wid}`);
		$("#tuto").css("width", `${wid}`);
	}
});
