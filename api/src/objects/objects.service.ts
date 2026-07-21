import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectEntity, ObjectDocument } from './schemas/object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { StorageService } from '../storage/storage.service';
import { ObjectsGateway } from './objects.gateway';

@Injectable()
export class ObjectsService {
  constructor(
    @InjectModel(ObjectEntity.name)
    private readonly objectModel: Model<ObjectDocument>,
    private readonly storage: StorageService,
    private readonly gateway: ObjectsGateway,
  ) {}

  async create(dto: CreateObjectDto, file: Express.Multer.File) {
    const { url } = await this.storage.upload(file);

    const created = await this.objectModel.create({
      title: dto.title,
      description: dto.description,
      imageUrl: url,
    });

    this.gateway.emitCreated(created.toObject());

    return created;
  }

  findAll() {
    return this.objectModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const object = await this.objectModel.findById(id).exec();

    if (!object) {
      throw new NotFoundException(`Object ${id} introuvable`);
    }

    return object;
  }

  async remove(id: string) {
    const object = await this.objectModel.findById(id).exec();

    if (!object) {
      throw new NotFoundException(`Object ${id} introuvable`);
    }

    // on supprime d'abord le fichier sur R2, puis le document Mongo
    await this.storage.delete(this.storage.keyFromUrl(object.imageUrl));
    await object.deleteOne();

    this.gateway.emitDeleted(id);
  }
}
