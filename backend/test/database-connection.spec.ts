    import { Test, TestingModule } from '@nestjs/testing';
    import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
    import { DataSource, Repository } from 'typeorm';
    import { ConfigModule, ConfigService } from '@nestjs/config';
    import { User } from '../src/modules/users/entities/user.entity';
    describe('Database Connection', () => {
    let dataSource: DataSource;
    let userRepo: Repository<User>;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
            TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST'),
                port: +configService.get('DB_PORT'),
                username: configService.get('DB_USERNAME'),
                password: configService.get('DB_PASSWORD'),
                database: configService.get('DB_DATABASE'),
                entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
                synchronize: true,
                dropSchema: true, 
            }),
            inject: [ConfigService],
            }),
            TypeOrmModule.forFeature([User]),
        ],
        }).compile();

        dataSource = module.get(DataSource);
        userRepo = module.get(getRepositoryToken(User));
        await dataSource.synchronize(true); 
    }, 60000);

    afterAll(async () => {
        await dataSource.dropDatabase();
        await dataSource.destroy();
    });

    it('should connect to database', async () => {
        expect(dataSource.isInitialized).toBe(true);
    });

    it('should insert and find user', async () => {
        const user = userRepo.create({ fullName: 'Test User', email: 'test@example.com' });
        await userRepo.save(user);
        const found = await userRepo.findOne({ where: { email: 'test@example.com' } });
        expect(found).toBeDefined();
        expect(found!.fullName).toBe('Test User');
    });
    });