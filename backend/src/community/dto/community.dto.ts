import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateStoryDto {
  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  authorAvatar?: string;

  @IsOptional()
  @IsString()
  authorBadge?: string;

  @IsOptional()
  @IsString()
  authorRole?: string;

  @IsOptional()
  @IsString()
  petId?: string;

  @IsString()
  @IsNotEmpty()
  petName: string;

  @IsString()
  @IsNotEmpty()
  petAvatar: string;

  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;
}

export class CreatePostDto {
  @IsOptional()
  @IsString()
  authorId?: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  authorAvatar?: string;

  @IsOptional()
  @IsString()
  authorBadge?: string;

  @IsOptional()
  @IsString()
  authorRole?: string;

  @IsOptional()
  @IsString()
  petId?: string;

  @IsString()
  @IsNotEmpty()
  petName: string;

  @IsOptional()
  @IsString()
  petBreed?: string;

  @IsOptional()
  @IsString()
  petAvatar?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  @IsString()
  postType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class SendDirectMessageDto {
  @IsString()
  @IsNotEmpty()
  recipientId: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsString()
  senderAvatar?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  recipientAvatar?: string;

  @IsString()
  @IsNotEmpty()
  encryptedPayload: string;

  @IsString()
  @IsNotEmpty()
  iv: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;
}

export class CreateCommunityReportDto {
  @IsString()
  @IsNotEmpty()
  reportedUserId: string;

  @IsOptional()
  @IsString()
  reportedUserName?: string;

  @IsOptional()
  @IsString()
  reporterName?: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  chatTranscriptSnippet?: string;

  @IsOptional()
  @IsString()
  reporterId?: string;
}
