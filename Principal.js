const GRAVEDAD = 250;
const juego = new Phaser.Game(800, 220, Phaser.CANVAS, 'bloque_juego');

let tileSprite;//para actualizar el movimiento del terreno, darle macarena
let limitesTerreno = 0;//pa que no se salga de los limites del nivel
let Mapa;
let Layer;
let Marco;
let Cursors;
let Piso;

class MarcoPlayer extends Phaser.Sprite {
    constructor(juego, x, y) {
        super(juego, x, y, 'Quieto');
    }

    load() {
        this.animations.add('Quiet', [0, 1, 2], 3, true);
        this.body.collideWorldBounds = true;

        //FIXUP: Agarro solo un par de frames porque los faltantes estan mal cortados CorreR = [0,2,3,4,5,6] frames de Correr
        //Marco.animations.add('CorreR', [0, 2, 3, 4, 5, 6], 10, true);
    }

    mover(cursors) {
        if (cursors.up.isDown && this.body.touching.down) {
            this.body.velocity.y = -200;
        }

        if(this.y >= 200) {
            this.body.velocity.y = 0;
        }

        if (cursors.right.isDown && this.x <= 770) {
            this.x++;
            if (this.x >= 600 && limitesTerreno < 460) {
                tileSprite.tilePosition.x -= 6;
                this.x--;
                limitesTerreno++;

            }
            if (limitesTerreno >= 460) {
                this.x++;
            }
        }
        if (cursors.left.isDown && this.x !== 10) {
            this.x--;
        }
    }

    updateSpecial(cursors) {
        this.animations.play('Quiet');
        this.mover(cursors);
    }
}

let Estado = {
    preload: function () {//sube todo
        juego.load.tilemap('mario', 'assets/super_mario.json', null, Phaser.Tilemap.TILED_JSON);
        juego.load.image('piso', 'assets/piso.png');
        juego.load.image('fondoterreno', 'assets/fondo.png');//cargo mi imagen
        juego.load.spritesheet('Correr', 'assets/Correr.png', 31.75, 40);//cargo mi conjunto de imagenes para marco y la nombro MarcoRun
        juego.load.spritesheet('Quieto', 'assets/Quieto.png', 30, 40);
        juego.load.image('Quieto2', 'assets/Quieto.png');
    },

    create: function () {//se arranca solo una vez como un constructor  mas o menos
        juego.physics.startSystem(Phaser.Physics.ARCADE);

        tileSprite = juego.add.tileSprite(0, 0, 800, 220, 'fondoterreno');//muestro por pantalla el terreno dandole los limites laterales, superior e inferior + el objeto
        Cursors = juego.input.keyboard.createCursorKeys();//guardo en Cursors lo que se presiona por teclado

        juego.physics.arcade.gravity.y = GRAVEDAD;

        Marco = new MarcoPlayer(juego, 35, 160, 1);

        juego.add.existing(Marco);
        juego.physics.enable(Marco);

        Marco.load();

        // Creo el piso
        Piso = juego.add.group();
        for(let x = 0; x < juego.width; x += 32) {
            let segmentoPiso = juego.add.sprite(x, juego.height - 20, 'piso');
            juego.physics.enable(segmentoPiso, Phaser.Physics.ARCADE);
            segmentoPiso.body.immovable = true;
            segmentoPiso.body.allowGravity = false;
            Piso.add(segmentoPiso);
        }
    },

    update: function () {//se verifica frame a frame izi
        juego.physics.arcade.collide(Marco, Piso);
        Marco.updateSpecial(Cursors);
    }
};

juego.state.add('principal', Estado);
juego.state.start('principal');