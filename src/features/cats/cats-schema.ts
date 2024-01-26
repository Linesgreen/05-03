import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

@Schema()
export class CatToy {
  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  price: number;
}

export const CatToySchema = SchemaFactory.createForClass(CatToy);

@Schema()
export class Cat {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  _id: Types.ObjectId;
  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  age: number;

  @Prop({
    required: true,
  })
  breed: string;

  @Prop({
    default: [],
  })
  tags: string[];

  @Prop({
    default: [],
    type: [CatToySchema],
  })
  toys: CatToy[];

  setAge(newAge: number) {
    if (newAge <= 0) throw new Error('Incorrect Age');
    this.age = newAge;
  }

  static createSuperCat() {
    return {};
  }
}

export const CatSchema = SchemaFactory.createForClass(Cat);
CatSchema.loadClass(Cat);

export type CatModelStaticType = {
  createSuperCat: () => any;
};
export type CatDocument = HydratedDocument<Cat>;
