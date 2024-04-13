import { SetMetadata } from "@nestjs/common"

export const PageAccess = (page: string) => SetMetadata('page', page);