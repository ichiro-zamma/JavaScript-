
//  状態管理（データ）
const products = [
  { id: 1, name: '天然水', price: 100, stock: 1 },
  { id: 2, name: 'ジャスミン茶', price: 130, stock: 1 },
  { id: 3, name: 'おいしい牛乳', price: 140, stock: 1 },
  { id: 4, name: 'コーラ', price: 160, stock: 1 },
  { id: 5, name: 'コーヒー', price: 110, stock: 1 },
  { id: 6, name: 'ジュース', price: 150, stock: 1 }
];

const vault = { 500: 5, 100: 10, 50: 5, 10: 10 };
let currentInsertedMoney = 0;
let isBonusMode = false;     // あたりモードフラグ
let isSlotSpinning = false;  // スロットが回転中かどうか

// HTMLの要素を取得
const moneyInput = document.getElementById('moneyInput');
const resultDiv = document.getElementById('result');
const currentMoneyDisplay = document.getElementById('currentMoneyDisplay');
const changeLamp = document.getElementById('change-empty-lamp');
const slotDisplay = document.getElementById('slot-display'); // スロット液晶
//画面の文字を置き換えることができる

//  機能（関数）

function updateMoneyDisplay() {//現在の投入金額を、画面の赤いLEDパネルに映し出します。
  if (currentMoneyDisplay) {
    currentMoneyDisplay.innerText = currentInsertedMoney;//パネルの文字を入れている合計金額に書き換えている
  }
}

function updateButtonStates() {//売り切れを表示させる機能
  products.forEach(product => {//商品を一つずつ順番に取りだしている
    if (product.stock <= 0) {//ストックが0なら
      const btn = document.getElementById(`btn-${product.id}`);
      if (btn) {
        btn.disabled = true;//ボタンを無効
        btn.innerText = '[ 売切れ ]';
      }
    }
  });
}

function calculateChange(changeRequired) {//おつりの計算機能
  if (changeRequired === 0) return {};//chageRequiredはおつりの金額
  const changeResult = { 500: 0, 100: 0, 50: 0, 10: 0 };
  const denominations = [500, 100, 50, 10];
  let remaining = changeRequired;
  const tempVault = { ...vault };

  for (const coin of denominations) {
    while (remaining >= coin && tempVault[coin] > 0) {
      remaining -= coin;
      tempVault[coin]--;
      changeResult[coin]++;
    }
  }
  return remaining === 0 ? changeResult : null;
}

function checkChangeLamp() {//つり銭切れの表示機能
  if (!changeLamp) return;
  if (vault[10] <= 2 || vault[50] <= 2) {
    changeLamp.style.display = 'inline';//つり銭切れを表示
  } else {
    changeLamp.style.display = 'none';//ランプ消す
  }
}

function insertMoney() {//お金を投入する機能
  if (isBonusMode) {
    resultDiv.innerHTML = '🎉 あたりです!先にもう1本商品を選んでください。';//当たった時にお金を入れないようにしている
    return;
  }
  if (isSlotSpinning) return; // スロット中は投入不可

  const inputVal = parseInt(moneyInput.value, 10); //入力されたものを10進数にしている
  const allowed = [10, 50, 100, 500, 1000];//制限している

  if (!inputVal || !allowed.includes(inputVal)) {//エラーチェック
    resultDiv.innerHTML = '❌ 10円、50円、100円、500円、1000円札のみ投入できます。';
    return;
  }

  currentInsertedMoney += inputVal;//入っているお金と合体
  moneyInput.value = '';//入力場所を空にしてる
  resultDiv.innerHTML = `🪙 ${inputVal}円を投入しました。`;//掲示板に表示
  
  updateMoneyDisplay();//金額パネルを更新
}

/**
 * 】スロットの抽選
 */
function startSlot(onComplete) {//コールバック関数
  isSlotSpinning = true//お金投入、ボタンをロックしている
  let count = 0;
  
  // 0.05秒ごとにランダムな数字をバラバラと表示させて動いているように見せる
  const interval = setInterval(() => {//指定した時間ごとに、同じ命令をずっと繰り返し実行
    const num1 = Math.floor(Math.random() * 10);//0から9を作っている
    const num2 = Math.floor(Math.random() * 10);
    const num3 = Math.floor(Math.random() * 10);
    slotDisplay.innerText = `${num1} ${num2} ${num3}`;//スロットに映してる
    count++;

    // 20回（約1秒）動いたらストップして結果を決める
    if (count >= 20) {
      clearInterval(interval);//intervalを止める
      isSlotSpinning = false;//ロック解除
      
      // 確率の設定：3分の1の確率で「7 7 7」にする。ハズレは別のランダムな数字。
      const isHit = Math.floor(Math.random() * 3) === 0; 
      
      if (isHit) {
        slotDisplay.innerText = "7 7 7";
        onComplete(true); // 当たりを伝える
      } else {
        // ハズレのときは777以外になるようにする
        let n1 = Math.floor(Math.random() * 9) + 1; // 1〜9
        let n2 = Math.floor(Math.random() * 9);
        if (n1 === 7 && n2 === 7) n2 = 8; // 777を完全に防ぐ
        slotDisplay.innerText = `${n1} ${n2} 4`;
        onComplete(false); // ハズレを伝える
      }
    }
  }, 50);//00.5秒
}

/**
 * ボタン：商品を押した時の処理
 */
function buyProduct(productId) {//購入処理
  if (isSlotSpinning) return; // スロット回転中はボタンを押せないようにする

  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (product.stock <= 0) {
    resultDiv.innerHTML = `❌ 【${product.name}】は売り切れです。`;
    return;
  }

  // あたりの時
  if (isBonusMode) {
    product.stock--;
    resultDiv.innerHTML = `<b>🎁 特典！【${product.name}】が無料で出てきました！</b><br>ありがとうございました！またお買い求めください。`;
    isBonusMode = false; 
    slotDisplay.innerText = "[- - -]"; // スロットをリセット
    updateButtonStates();//売り切れを更新
    return;
  }

  if (currentInsertedMoney < product.price) {//お金不足
    const lack = product.price - currentInsertedMoney;
    resultDiv.innerHTML = `❌ お金が足りません！【${product.name}】は ${product.price}円 です。（不足: ${lack}円）`;
    return;
  }
//おつり計算
  const changeRequired = currentInsertedMoney - product.price;
  const changeCoins = calculateChange(changeRequired);

  if (changeCoins === null) {
    resultDiv.innerHTML = `<span style="color: #ff3333; font-weight: bold;">⚠️ つり銭切れエラー！お釣り（${changeRequired}円）が出せないため選択できません。</span>`;
    return;
  }

  // 購入確定処理
  product.stock--;
  for (const coin in changeCoins) {
    vault[coin] -= changeCoins[coin];
  }

  let changeText = changeRequired > 0 ? `<br>お釣り（残り ${changeRequired} 円）が続けて使えます。` : '<br>お釣りはありません。';
  resultDiv.innerHTML = `<b>ガシャ！【${product.name}】が出てきました！</b>${changeText}`;
  
  currentInsertedMoney = changeRequired;//自販機の金額をおつりの金額に書き換える
  updateMoneyDisplay();//金額パネルを残りお釣りの額にする
  updateButtonStates();//今ので売り切れたら売切れを点灯
  checkChangeLamp();//金庫がなくなったら銭切れを点灯

  // 商品が出たあとにスロット
  startSlot((isHit) => {
    if (isHit) {
      isBonusMode = true;
      resultDiv.innerHTML += `<br><br><span style="color: #ff3333; font-weight: bold; font-size: 16px;">🎉 ピピピピピッ!【777】が揃いました!!!<br>あともう1本、お好きな商品を「無料」で選べます!ボタンを押してね!</span>`;
    } else {
      resultDiv.innerHTML += `<br><br><span style="color: #999;">…ハズレです（また挑戦してね）</span>`;
    }
  });
}

function cancelAndRefund() {
  if (isBonusMode) {//返金拒否
    resultDiv.innerHTML = ' あたりなので返金はできません。先にもう1本選んでね!';
    return;
  }
  if (isSlotSpinning) return;//返金拒否

  if (currentInsertedMoney === 0) {//お金が入ってなければ終了
    resultDiv.innerHTML = '投入されているお金はありません。';
    return;
  }
  //返金処理
  resultDiv.innerHTML = `キャンセルされました。投入金額 ${currentInsertedMoney} 円を返却します。`;
  currentInsertedMoney = 0;//手持ちを0円に
  moneyInput.value = '';//入力もなしに
  updateMoneyDisplay();//画面も
}

window.onload = function() {
  updateMoneyDisplay(); // 1. 画面が起動した瞬間に、投入金額のLEDパネルを「0円」と正しく表示する
  checkChangeLamp();    // 2. 画面が起動した瞬間に、金庫の小銭をチェックして「つり銭切れ」を点灯させるか判断する
  updateButtonStates(); // 3. 画面が起動した瞬間に、商品の在庫をチェックして最初から在庫0のものを「売切れ」にする
};