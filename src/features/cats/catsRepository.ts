import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat, CatDocument, CatModelStaticType } from './cats-schema';

@Injectable()
export class CatsRepository {
  constructor(
    @InjectModel(Cat.name)
    private CatModel: Model<CatDocument> & CatModelStaticType,
  ) {}

  async create(createCatDto: any): Promise<Cat> {
    const superCat = this.CatModel.createSuperCat();
    console.log(superCat);

    const createdCat = new this.CatModel(createCatDto);
    return createdCat.save();
  }

  async findAll(): Promise<Cat[]> {
    return this.CatModel.find().exec();
  }

  async save(cat: CatDocument) {
    await cat.save();
  }
}
