-- CreateTable
CREATE TABLE "SavedAct" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "actId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SavedAct_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SavedAct" ADD CONSTRAINT "SavedAct_actId_fkey" FOREIGN KEY ("actId") REFERENCES "Act"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedAct" ADD CONSTRAINT "SavedAct_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
