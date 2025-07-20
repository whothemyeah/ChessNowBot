-- CreateTable
CREATE TABLE "UserProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "avatarURL" TEXT,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlayedGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timerEnabled" BOOLEAN NOT NULL,
    "timerInit" INTEGER NOT NULL,
    "timerIncrement" INTEGER NOT NULL,
    "pgn" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "winner" TEXT,
    "gameMode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "whitePlayerID" INTEGER NOT NULL,
    "blackPlayerID" INTEGER NOT NULL,
    CONSTRAINT "PlayedGame_whitePlayerID_fkey" FOREIGN KEY ("whitePlayerID") REFERENCES "UserProfile" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT "PlayedGame_blackPlayerID_fkey" FOREIGN KEY ("blackPlayerID") REFERENCES "UserProfile" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_username_key" ON "UserProfile"("username");

-- CreateIndex
CREATE INDEX "PlayedGame_winner_idx" ON "PlayedGame"("winner");

-- CreateIndex
CREATE INDEX "PlayedGame_whitePlayerID_idx" ON "PlayedGame"("whitePlayerID");

-- CreateIndex
CREATE INDEX "PlayedGame_blackPlayerID_idx" ON "PlayedGame"("blackPlayerID");
