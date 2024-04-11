import { LobType, Lobby } from '@prisma/client';
import { CreateLobTypeDto } from './dto-Lobby/create_lobType.dto';
import { CreateLobDto } from './dto-Lobby/create_lobby.dto';
import { UpdateLobTypeDto } from './dto-Lobby/update_lobType.dto';
import { UpdateLobDto } from './dto-Lobby/update_lobby.dto';
import { LobbyService } from './lobby.service';
import { Controller, Get, Post, Param, Body, Patch, Delete, Query } from '@nestjs/common';

@Controller('lobby')
export class LobbyController {
  constructor(private lobbyService:LobbyService) {}


  /*
  =================== LOBBY TYPE ===================
   */
  @Get('types') // get lobbies type
  async getLobbyTypes(@Query('includeDeleted') includeDeleted = 'false'): Promise<LobType[]> {

    const includeDeletedBool = includeDeleted === 'true';
    return this.lobbyService.getLobbyTypes(includeDeletedBool);
  }

  @Get('type/:id') // get lobby type by id
  async getLobbyTypeByID(@Param() param:{id:string}):Promise<LobType> {
    const { id } = param;

    return this.lobbyService.getLobbyTypeByID(id);
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
