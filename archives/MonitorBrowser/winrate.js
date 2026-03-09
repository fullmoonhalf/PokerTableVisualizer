var WinRate = {};

(function(v)
{
	// 各カードの大きさを2桁ずつ、それの上位なので1 00 00 00 00 00
	v.HandCoef = 10000000000;
	v.TopCoef = 100000000;

	v.Rank1Pair = 1;
	v.Rank2Pair = 2;
	v.RankSet = 3;
	v.RankSt = 4;
	v.RankFl = 5;
	v.RankFull = 6;
	v.RankQuads = 7;
	v.RankStFl = 8;

	// arg:
	//   hands int[2][] //< ハンド 返り値のinfosの個数と連動
	//   board int[]    //< ボード 現状 length >= 3 推奨 (PFも一応やってくれるけどバカ重)
	//   expose int[]   //< エクスポーズ（デッキから抜くだけ）省略可
	// 
	// return {
	//    infos[] {
	//      hand int[2] //< argのhands
	//      win  int    //< 勝ち数（チョップ含む）
	//      comb int    //< 組み合わせ数 win/combで勝率
	//    }
	// }
	v.calc = function(hands, board, expose)
	{
		// デッキの残り
		var exclude = [];
		if (hands)
		{
			for (var i=0; i<hands.length; i++)
				exclude = exclude.concat(hands[i]);
		}
		if (board)
			exclude = exclude.concat(board);
		if (expose)
			exclude = exclude.concat(expose);

		var deck = v.genDeck(exclude);

		// デッキの残りから引ける組み合わせ
		var comb;
		if (board.length >= 5)
		{
			comb = [[]];
		}
		else
		{
			comb = v.combination(deck, 5 - board.length);
		}

		// 勝ち負けチェック
		var infos = [];
		for (var i=0; i<hands.length; i++)
		{
			infos[i] = {
				hand: hands[i],
				win: 0,
				comb: comb.length,
			};
		}

		for (var i=0; i<comb.length; i++)
		{
			// この時のボード
			var b = board.concat(comb[i]);

			// 情報
			var win = [];
			var max = 0;

			// 誰が勝ちか
			for (var hi=0; hi<hands.length; hi++)
			{
				var h0 = hands[hi];

				// このボードの時のpower
				var pow = v.calcPower7Cards(h0.concat(b));

				// 現状勝ってる（Index保持）
				if (max < pow)
				{
					max = pow;
					win = [hi];
				}
				else if (max == pow)
				{
					win.push(hi);
				}
			}

			// 勝った人全員＋１
			for (var wi=0; wi<win.length; wi++)
			{
				infos[win[wi]].win++;
			}
		}
		
		return {
			infos: infos,
		};
	}

	v.conv = function(value)
	{
		var i0 = parseInt(value);

		// 数字になる
		if (isNaN(i0) == false)
		{
			return new v.Card(i0);
		}

		return value;
	}

	v.Suite = [
		"♠",
		"♥",
		"♦",
		"♣",
	];
	v.Num = "0123456789TJQKA";
	v.Card = class
	{
		constructor(index)
		{
			var i1 = index - 1;
			var n = i1 % 13 + 1;
			this.suite = Math.floor(i1 / 13);
			this.num = n == 1 ? 14 : n;
			this.same = 0;
		}

		disp()
		{
			return v.Suite[this.suite] + v.Num.charAt(this.num);
		}
	};

	v.genDeck = function(exclude)
	{
		var ret = [];

		if (exclude)
		{
			for (var i=1; i<=52; i++)
			{
				if (exclude.includes(i))
					continue;

				ret.push(i);
			}
		}
		else
		{
			for (var i=1; i<=52; i++)
			{
				ret.push(i);
			}
		}

		return ret;
	};

	// N枚の中で一番強い役
	v.calcPower7Cards = function(index)
	{
		if (index.length < 5)
			return -1;

		var cards = [];

		for (var i=0; i<index.length; i++)
		{
			cards[i] = new v.Card(index[i]);
		}

		var max = 0;
		var com = v.combination(cards, 5);

		for (var i=0; i<com.length; i++)
		{
			var pow = v.calcPower(com[i]);

			if (max < pow)
				max = pow;
		}

		return max;
	}

	// 5枚の強さ計算
	v.calcPower = function(cards)
	{
		// 数字降順でソート
		var sorted = cards.sort(function(a, b)
		{
			var dif = b.num - a.num;
			if (dif != 0)
				return dif;
			return a.suite - b.suite;
		});

		var power = 0;
		var rank = 0;

		// ストレート / フラッシュ
		var st = v.checkStraight(sorted);
		var is_flash = v.checkFlush(sorted);
		if (st >= 0)
		{
			// ストフラ
			if (is_flash)
				rank = v.RankStFl;
			// ストレート
			else
				rank = v.RankSt;

			// 何ハイストレートか、だけ入れておく
			power = st * v.TopCoef;
		}
		else if (is_flash)
		{
			rank = v.RankFl;
		}
		// ペアチェック
		else
		{
			var sm = v.checkSameNumber(sorted);
			if (sm)
			{
				// 4
				if (sm.max == 4)
				{
					rank = v.RankQuads;
				}
				// 3
				else if (sm.max == 3)
				{
					if (sm.pairs.length > 1)
						rank = v.RankFull;
					else
						rank = v.RankSet;
				}
				// 2
				else
				{
					if (sm.pairs.length > 1)
						rank = v.Rank2Pair;
					else
						rank = v.Rank1Pair;
				}
				
				// ペア優先でソート
				sorted = cards.sort(function(a, b)
				{
					var sdif = b.same - a.same;
					if (sdif != 0)
						return sdif;
					var dif = b.num - a.num;
					if (dif != 0)
						return dif;
					return a.suite - b.suite;
				});
			}
		}

		// ストレート以外は各カードのパワーを代入
		if (st < 0)
		{
			var d = 1;
			for (var i=0; i<5; i++)
			{
				power += sorted[4-i].num * d;
				d *= 100;
			}
		}

		power += rank * v.HandCoef;

		return power;
	};

	// ストレート
	v.checkStraight = function(sorted)
	{
		var n = sorted[0].num;
		if (sorted[1].num == n-1 &&
			sorted[2].num == n-2 &&
			sorted[3].num == n-3 &&
			sorted[4].num == n-4 )
		{
			return n;
		}
		if (sorted[0].num == 14 &&
			sorted[1].num == 5 &&
			sorted[2].num == 4 &&
			sorted[3].num == 3 &&
			sorted[4].num == 2)
		{
			return 5;
		}
		return -1;
	}

	// フラッシュ
	v.checkFlush = function(cards)
	{
		if (cards[0].suite == cards[1].suite &&
			cards[0].suite == cards[2].suite &&
			cards[0].suite == cards[3].suite &&
			cards[0].suite == cards[4].suite)
		{
			return true;
		}
		return false;
	}

	// 同じカード
	v.checkSameNumber = function(cards)
	{
		var v = [];
		var max = 1;
		for (var i=0; i<cards.length; i++)
		{
			var c = cards[i];
			if (!v[c.num])
			{
				v[c.num] = [c];
				c.same = 1;
			}
			else
			{
				var l = v[c.num];
				l.push(c);
				for (var j=0;j<l.length;j++)
				{
					l[j].same = l.length;
				}

				if (max < l.length)
					max = l.length;
			}
		}

		// 1ペアも無い
		if (max < 2)
			return null;

		var pairs = [];
		for (var i=0; i<v.length; i++)
		{
			if (!v[i])
				continue;

			if (v[i].length >= 2)
			{
				pairs.push({
					rank: i,
					same: v[i],
				});
			}
		}
		return {
			max: max,
			pairs: pairs,
		};
	}

	v.dispCards = function(cards)
	{
		var ret = "";
		for (var i=0; i<cards.length; i++)
		{
			var c = cards[i];
			if (!c.num)
				c = new v.Card(c);

			ret += c.disp();
		}
		return ret;
	}

	v.combination = function(array, num)
	{
		var ret = [];

		if (array.length < num)
			return ret;

		if (num == 1)
		{
			for (var i=0; i<array.length; i++)
			{
				ret[i] = [array[i]];
			}
			return ret;
		}

		var k = array.length - num + 1;
		for (var i=0; i<k; i++)
		{
			var sub0 = v.combination(array.slice(i + 1), num - 1);
			for (var j=0; j<sub0.length; j++)
			{
				ret.push([array[i]].concat(sub0[j]));
			}
		}
		return ret;
	}

	v.permitation = function(array, num)
	{
		var ret = [];

		if (array.length < num)
			return ret;

		if (num == 1)
		{
			for (var i=0; i<array.length; i++)
			{
				ret[i] = [array[i]];
			}
			return ret;
		}

		for (var i=0; i<array.length; i++)
		{
			var sub0 = array.concat();
			sub0.splice(i, 1);

			var sub1 = v.permitation(sub0, num - 1);
			for (var j=0; j<sub1.length; j++)
			{
				ret.push([array[i]].concat(sub1[j]));
			}
		}

		return ret;
	}

})(WinRate);

