import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLobTypeDto } from './dto/create_lobType.dto';
import { UpdateLobTypeDto } from './dto/update_lobType.dto';
import { CreateLobDto } from './dto/create_lobby.dto';
import { UpdateLobDto } from './dto/update_lobby.dto';
import { LobType, Lobby, Prisma, Shift } from '@prisma/client';
import { getStartAndEndOfDay } from 'utils';
import { LobbyIncludedLobType } from './lobby.interface';
import { CreateShiftDto } from './dto/create_shift.dto';
@Injectable()
export class LobbyService {
  constructor(private prisma: PrismaService) {}
  


  async getShifts():Promise<Shift[]> {
    try {

      const shifts: Shift[] = await this.prisma.shift.findMany({
        where: { deleted_at: null }
      })
      return shifts
    } catch (error) {
      throw error
    }
  }
  
  async createShift(name:string) {
    try{
     
      const shift = await this.prisma.shift.create({
        data: { name } as any
      })

      return shift
    } catch (error) {
      throw error
    }
  }
  async deleteShift(id:string) {
    try{
     
      const shift = await this.prisma.shift.update({
        where: { id },
        data: {
          deleted_at: new Date()
        }
      })

      return shift
    } catch (error) {
      throw error
    }
  }


 /*
  =================== LOBBY TYPE ===================
*/
  async getLobbyTypes(includeDeletedBool:boolean, includeLobby:boolean):Promise<LobType[]> {
    try {
      const queryObject: Prisma.LobTypeFindManyArgs = {
        orderBy: { created_at: 'asc' },
      };
  
      if (includeLobby) {
        queryObject.include = {
          Lobby: {
            where: {
              deleted_at: null,
            },
          },
        };
      }
  
      if (!includeDeletedBool) {
        queryObject.where = {
          deleted_at: null,
        };
      }
  
      const lobbyTypeList = await this.prisma.lobType.findMany(queryObject);
      return lobbyTypeList;
    } catch (error) {
      throw error
    }
  }

  async getLobbyTypeByID(id:string):Promise<LobType>{
    try {
      const lobbyType:LobType = await this.prisma.lobType.findUnique({
        where: {
          id
        }
      })

      return lobbyType
    } catch (error) {
      throw error
    }
  }

  async findLobbyTypeByName(type_name:string):Promise<LobType[]>{
    try {
      const lobbyType:LobType[] = await this.prisma.lobType.findMany({
        where: {
          type_name: { contains: type_name },
          deleted_at: null
        },
        orderBy: { created_at: "asc" }
      })

      return lobbyType
    } catch (error) {
      throw error
    }
  }

  async createLobbyType(dataCreate:CreateLobTypeDto) {
    try{
      const { max_table_count, min_table_price, deposit_percent, type_name } = dataCreate;
      
      const LobbyType = await this.prisma.lobType.create({
        data: {
          max_table_count, 
          min_table_price,
          deposit_percent,
          type_name
        } as any
      })

      return LobbyType
    } catch (error) {
      throw error
    }
  }

  async updateLobbyType(id:string, dataUpdate:UpdateLobTypeDto) {
    try {
        const lobType = await this.prisma.lobType.update({
          where: { id },
          data: dataUpdate
        })

        return lobType
    } catch (error) {
      throw error
    }
  }

  async deleteLobType(id:string){
    try {
      const deletedLobType = await this.prisma.lobType.update({
        data: { deleted_at: new Date()} as any,
        where: { id }
      }) 

      return {
        deletedId: deletedLobType.id
      }
    } catch (error) {
      throw error
    }
  }

 /*
  =================== LOBBY ===================
*/

  async createLobby(dataCreate:CreateLobDto) {
    try{
      const { lob_type_id, name } = dataCreate;
      
      const Lobby = await this.prisma.lobby.create({
        data: {
          lob_type_id,
          name
        } as any
      })

      return Lobby
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getLobbies(date:string, lob_type_id:string, includeDeletedBool:boolean):Promise<Lobby[]> {
    try {
      const queryObj: { 
        where?: { 
          lob_type_id?: string,
          date?: string,
          deleted_at?: any 
        }, 
        orderBy: any,
        include: any,
      } = {
        orderBy: { created_at: "asc" },
        include : {
            Wedding: true
        }
      };

      if(lob_type_id) {
        queryObj.where = { ...queryObj.where, 'lob_type_id': lob_type_id };
      }

      if(!includeDeletedBool) {
        queryObj.where = { ...queryObj.where ,deleted_at: null};
      }

      if(date) {
          const { startOfDay, endOfDay } = getStartAndEndOfDay(date)
          queryObj.include = {
              Wedding: {
                  where: {
                      wedding_date: {
                          gte: startOfDay.toISOString(),
                          lte: endOfDay.toISOString(),
                      }
                  }
              }
          }
      }
    
      const lobbyList:Lobby[] = await this.prisma.lobby.findMany(queryObj)

      return lobbyList
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async getLobbyById(id:string, includeDeletedBool: boolean):Promise<LobbyIncludedLobType>{
    try {
      const queryObject: {
        where: any,
        include: {
          LobType: boolean
        }
      } = {
        where: { id },
        include: {
          LobType: true
        }
      };

      if(!includeDeletedBool) {
        queryObject.where = { 
          id,
          deleted_at: null
        }
      }

      const lobby:LobbyIncludedLobType = await this.prisma.lobby.findUnique(queryObject)
      return lobby
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async updateLobby(id:string, dataUpdate:UpdateLobDto) {
    try {
        const lobby = await this.prisma.lobby.update({
          where: { id },
          data: dataUpdate
        })

        return lobby
    } catch (error) {
      throw error
    }
  }

  async findLobbyByName(name:string, lobType_id:string):Promise<Lobby[]>{
    try {
      const lobby:Lobby[] = await this.prisma.lobby.findMany({
        where: {
          name: { contains: name },
          lob_type_id: lobType_id,
          deleted_at: null
        },
        orderBy: { created_at: "asc" }
      })

      console.log(lobby)

      return lobby
    } catch (error) {
      throw error
    }
  }

  async softDeleteLobby(id:string){
    try {
      const deletedLobby = await this.prisma.lobby.update({
        where: { id },
        data: { deleted_at: new Date() } as any
      })

      return {
        deletedId: deletedLobby.id
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

}
