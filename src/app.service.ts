/*
 * Copyright (c) 2026 Sokhorio Margon D' Costa. All Rights Reserved.
 *
 * This repository is for portfolio demonstration purposes only.
 * No part of this code may be used, copied, or distributed for commercial or private projects without explicit written permission.
 */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!, Welcome to Bible Verse!';
  }
}
