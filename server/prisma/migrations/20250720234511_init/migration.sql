-- CreateTable
CREATE TABLE "UserProfile" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "avatarURL" TEXT,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayedGame" (
    "id" TEXT NOT NULL,
    "timerEnabled" BOOLEAN NOT NULL,
    "timerInit" INTEGER NOT NULL,
    "timerIncrement" INTEGER NOT NULL,
    "pgn" TEXT NOT NULL,
    "resolution" TEXT NOT NULL,
    "winner" TEXT,
    "gameMode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "whitePlayerID" INTEGER NOT NULL,
    "blackPlayerID" INTEGER NOT NULL,

    CONSTRAINT "PlayedGame_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_whitePlayerID_fkey" FOREIGN KEY ("whitePlayerID") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "PlayedGame" ADD CONSTRAINT "PlayedGame_blackPlayerID_fkey" FOREIGN KEY ("blackPlayerID") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
