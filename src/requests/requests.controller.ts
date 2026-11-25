import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, Req } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { QueryRequestsDto } from './dto/query-requests.dto';
import { AssignDto } from './dto/assign.dto';
import { ResolveDto } from './dto/resolve.dto';
import { ReopenDto } from './dto/reopen.dto';
import { FeedbackDto } from './dto/feedback.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RequestsController {
  constructor(private requestsService: RequestsService) {}

  @Post()
  @Roles('REQUESTER')
  create(@Body() dto: CreateRequestDto, @Req() req: any) {
    return this.requestsService.create(dto, req.user);
  }

  @Get()
  findAll(@Query() query: QueryRequestsDto, @Req() req: any) {
    return this.requestsService.findAll(query, req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.requestsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('REQUESTER')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRequestDto, @Req() req: any) {
    return this.requestsService.update(id, dto, req.user);
  }

  @Post(':id/cancel')
  @Roles('REQUESTER')
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.requestsService.cancel(id, req.user);
  }

  @Post(':id/assign')
  @Roles('DISPATCHER')
  assign(@Param('id', ParseIntPipe) id: number, @Body() dto: AssignDto, @Req() req: any) {
    return this.requestsService.assign(id, dto, req.user);
  }

  @Post(':id/start')
  @Roles('TECHNICIAN')
  start(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.requestsService.start(id, req.user);
  }

  @Post(':id/resolve')
  @Roles('TECHNICIAN')
  resolve(@Param('id', ParseIntPipe) id: number, @Body() dto: ResolveDto, @Req() req: any) {
    return this.requestsService.resolve(id, dto, req.user);
  }

  @Post(':id/close')
  @Roles('REQUESTER')
  close(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.requestsService.close(id, req.user);
  }

  @Post(':id/reopen')
  @Roles('REQUESTER')
  reopen(@Param('id', ParseIntPipe) id: number, @Body() dto: ReopenDto, @Req() req: any) {
    return this.requestsService.reopen(id, dto, req.user);
  }

  @Post(':id/feedback')
  @Roles('REQUESTER')
  feedback(@Param('id', ParseIntPipe) id: number, @Body() dto: FeedbackDto, @Req() req: any) {
    return this.requestsService.addFeedback(id, dto, req.user);
  }
}