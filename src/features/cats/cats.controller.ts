import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Types } from 'mongoose';
import { CatsRepository } from './catsRepository';

@Controller('app')
export class CatsController {
  constructor(protected readonly catsRepository: CatsRepository) {}

  @Get('cats')
  getAllCats() {
    return this.catsRepository.findAll();
  }

  @Post('cats')
  createCat(@Body() dto) {
    return this.catsRepository.create(dto);
  }

  @Put('cats/:id')
  async updateCat(@Param('id') id: any) {
    const cats = await this.catsRepository.findAll();
    const targetCat = cats.find((c) => c._id.equals(new Types.ObjectId(id)));
    targetCat.setAge(999);
  }
}
