import { Column } from "typeorm";
import { ProductEntity } from "../product.entity";

export class BookEntity extends ProductEntity {
    @Column()
    author: string;

    @Column()
    publisher: string;

    @Column()
    publicationDate: string;

    @Column()
    pages: number;

    @Column()
    genre: string;
}