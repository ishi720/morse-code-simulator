FROM node:20-alpine

WORKDIR /app

# パッケージファイルをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# ポート4173を公開（Viteのプレビューサーバーのデフォルト）
EXPOSE 4173

# Viteのプレビューサーバーを起動
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]