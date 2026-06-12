・アプリの概要
JavaScriptを用いて作成したWeb版の自動販売機です。
商品の購入、投入金額の管理、釣銭計算、在庫管理、返金機能に加え、スロットによる当たり機能も実装しています。

・機能一覧
　商品購入機能
　投入金額の管理
　釣銭計算
　売切れ判定
　釣銭切れ判定
　購入キャンセル・返金
　スロット抽選機能
　当たり時の無料購入機能

・動かし方（セットアップ手順、実行コマンド）
　1. VS Codeでプロジェクトを開く。
　2. Dev Containerでコンテナを起動する。
　3. ターミナルで以下のコマンドを実行する。
　　http-server -p 3000
　4. ブラウザで http://localhost:3000/kadai/にアクセスする。
　5. 自動販売機が表示される。


・使用技術
　HTML
　CSS
　JavaScript
　Node.js
　Docker
　Dev Container（VS Code）
　http-server
　nodemon