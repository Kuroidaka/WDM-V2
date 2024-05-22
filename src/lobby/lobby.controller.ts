import { LobType, Lobby, Shift } from '@prisma/client';
import { CreateLobTypeDto } from './dto/create_lobType.dto';
import { CreateLobDto } from './dto/create_lobby.dto';
import { UpdateLobTypeDto } from './dto/update_lobType.dto';
import { UpdateLobDto } from './dto/update_lobby.dto';
import { LobbyService } from './lobby.service';
import { Controller, Get, Post, Param, Body, Patch, Query, UseGuards, Delete } from '@nestjs/common';
import { PageAccess } from 'src/auth/page_access.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PageGuard } from 'src/auth/page.guard';

@PageAccess('lobby')
@UseGuards(JwtAuthGuard, PageGuard)
@Controller('lobby')
export class LobbyController {
  constructor(private lobbyService:LobbyService) {}
  /*
  =================== LOBBY TYPE ===================
   */
  @Get('shifts') // get lobbies type
  async getShifts(): Promise<Shift[]> {

    return this.lobbyService.getShifts();
  }
  @Post('shifts') // get lobbies type
  async createShift(@Body('name') name:string): Promise<Shift> {

    return this.lobbyService.createShift(name);
  }
  @Delete('shifts/:id') // get lobbies type
  async deleteShift(@Param('id') id:string) {

    return this.lobbyService.deleteShift(id);
  }

  @Get('types') // get lobbies type
  async getLobbyTypes(
    @Query('includeDeleted') includeDeleted = 'false',
    @Query('includeLobby') includeLobby = 'false'
  ): Promise<LobType[]> {

    const includeDeletedBool = includeDeleted === 'true';
    const includeLobbyBool = includeLobby === 'true';
    return this.lobbyService.getLobbyTypes(includeDeletedBool, includeLobbyBool);
  }

  @Get('type/:id') // get lobby type by id
  async getLobbyTypeByID(@Param() param:{id:string}):Promise<LobType> {
    const { id } = param;

    return this.lobbyService.getLobbyTypeByID(id);
  }

  @Get('find_type_by_name') // get lobby type by id
  async findLobbyTypeByName(@Query('type_name') type_name:string):Promise<LobType[]> {

    return this.lobbyService.findLobbyTypeByName(type_name);
  }

  @Post('type/create') // create lobby type
  async createLobType(@Body() dataCreate: CreateLobTypeDto) {
    return this.lobbyService.createLobbyType(dataCreate)
  }

  @Patch('type/:id/update') // update lobby type
  async updateLobType(@Param() param:{ id:string }, @Body() dataUpdate: UpdateLobTypeDto) {
    const { id } = param;
    return this.lobbyService.updateLobbyType(id, dataUpdate)
  }

  @Patch('/type/:id/soft-delete') // soft delete lobby type
  async deleteLobType(@Param() param:{ id:string }) {
    const { id } = param;
    return this.lobbyService.deleteLobType(id);
  }

  /*
  =================== LOBBY ===================
   */

 @Get()
  async getLobbies( // Get lobbies by date or lobby type id
    @Query('date') date?:string,
    @Query('lob_type_id') lob_type_id?:string,
    @Query('includeDeleted') includeDeleted = 'false'
  ):Promise<Lobby[]> {
    const includeDeletedBool = includeDeleted === 'true'
    return this.lobbyService.getLobbies(date, lob_type_id, includeDeletedBool);
  }

  @Get('/find_lob_by_name') // get lobby type by id
  async findLobbyByName(@Query('name') name:string, @Query('lobType_id') lobType_id:string):Promise<Lobby[]> {

    return this.lobbyService.findLobbyByName(name, lobType_id);
  }

  @Get('/:id') // Get lobby by id 
  async getLobbyById(
    @Param('id') id:string,
    @Query('includeDeleted') includeDeleted = 'false'
  ) {
    const includeDeletedBool = includeDeleted === 'true'
    return this.lobbyService.getLobbyById(id, includeDeletedBool)
  }

  @Post('create') // Create lobby
  async createLobby(@Body() dataCreate: CreateLobDto) {
    return this.lobbyService.createLobby(dataCreate)
  }

  @Patch('/:id/update') // update lobby
  async updateLobby(@Param() param:{ id:string }, @Body() dataUpdate: UpdateLobDto) {
    const { id } = param;
    return this.lobbyService.updateLobby(id, dataUpdate)
  }


  @Patch('/:id/soft-delete') // soft delete lobby
  async softDeleteLobby(@Param('id') id:string) {
    return this.lobbyService.softDeleteLobby(id);
  }
}
