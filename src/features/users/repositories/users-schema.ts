import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserOutputType } from '../types/output';
import { HydratedDocument } from 'mongoose';

// noinspection RegExpRedundantEscape
@Schema()
export class AccountData {
  @Prop({ required: true, minlength: 3, maxlength: 10 })
  login: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  passwordHash: string;
  @Prop({ required: true })
  createdAt: string;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);

@Schema()
export class EmailConfirmation {
  @Prop({ required: true }) confirmationCode: string;
  @Prop({ required: true }) expirationDate: string;
  @Prop({ required: true }) isConfirmed: boolean;
}

export const EmailConfirmationSchema = SchemaFactory.createForClass(EmailConfirmation);

@Schema()
export class User {
  @Prop({ required: true }) _id: string;

  @Prop({ _id: false, required: true, type: AccountDataSchema })
  accountData: AccountData;

  @Prop({ _id: false, required: true, type: EmailConfirmationSchema })
  emailConfirmation: EmailConfirmation;

  toDto(): UserOutputType {
    return {
      id: this._id,
      login: this.accountData.login,
      email: this.accountData.email,
      createdAt: this.accountData.createdAt,
    };
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);
export type UsersDocument = HydratedDocument<User>;
