import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateVisibilityDto } from './dto/update-visibility.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../user/entity/role.entity';

// ─── 공개 API ─────────────────────────────────────────
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  getCategoryTree() {
    return this.categoryService.getCategoryTree();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }
}

// ─── 어드민 API ────────────────────────────────────────
@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminCategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Patch(':id/visibility')
  updateVisibility(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return this.categoryService.updateVisibility(id, dto.isVisible);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
