var CMD_ID = 137;
var LOOP_ID = 180;
var init = false;
var cb = [];
var lb = [];
var ents = [];

//Key symbols/words
var player = "@p";
var random = "@r";
var all = "@a";
var rel = "~";
var health = "h";

//Directories
var CB_FILE;
var SDCARD = android.os.Environment.getExternalStorageDirectory();
var WORLDS = new java.io.File(SDCARD, "games/com.mojang/minecraftWorlds");

function initMod() {

    //Command Block
    Block.defineBlock(CMD_ID, "Command Block", ["command_block", 0], 1, false, 0);
    Block.setDestroyTime(CMD_ID, 0.3);
    Block.setExplosionResistance(CMD_ID, 18, 000, 000);

    Block.defineBlock(LOOP_ID, "Loop Block", ["enchanting_table_top", 0], 1, false, 0);
    Block.setDestroyTime(LOOP_ID, 0.3);
    Block.setShape(LOOP_ID, 0, 0, 0, 1, 1, 1);
    var color = [0xB40700];
    //Block.setColor(LOOP_ID, color);
    Block.setExplosionResistance(LOOP_ID, 18, 000, 000);

}

function cmdBlock(x, y, z) {

    this.x = x;
    this.y = y;
    this.z = z;
    this.cmd = "";
    this.powered = false;
    this.looping = false;

    this.getX = function () {
        return this.x
    }
    this.getY = function () {
        return this.y
    }
    this.getZ = function () {
        return this.z
    }

    this.setCommand = function (cmd) {

        this.cmd = cmd;

    }

    this.setLooping = function (looping) {

        this.looping = looping;

    }

    this.startCommand = function () {

        if(procCmd(this.cmd, this.getX(), this.getY(), this.getZ())) {

            //cmdTrue(this.x, this.y, this.z);
            return true;

        } else {

            return false;

        }

    }

    this.setPowered = function (powered) {

        this.powered = powered;

    }

}

function getCmdBlock(x, y, z) {

    for(var i = 0; i < cb.length; i++) {

        if(cb[i].x == x && cb[i].y == y && cb[i].z == z) {

            return cb[i];
            break;

        }

    }

}

function cmdMessage(message) {

    clientMessage("[@]" + message);

}

function pnMessage(message) {

    clientMessage(ChatColor.GREY + "[@]" + message);

}

function readFile(file) {

    var str;
    var br = new java.io.BufferedReader(new java.io.FileReader(file));
    var data = new java.lang.StringBuilder();

    while((str = br.readLine()) != null) {

        data.append(str);
        data.append("\n");

    }

    return data.toString();

}

function openCmdMenu(x, y, z) {

    var ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();

    ctx.runOnUiThread(new java.lang.Runnable() {

        run: function () {

            try {

                var b = new android.app.AlertDialog.Builder(ctx);
                var cmd_box = new android.widget.EditText(ctx);
                cmd_box.setHint("Enter a command");
                b.setTitle("Command Block")
                    .setView(cmd_box)
                    .setMessage("@p - Targets the player\n@a - Targets all entities\n@r - Targets a random entity")
                    .setPositiveButton("Done", new android.content.DialogInterface.OnClickListener() {

                        onClick: function (di, v) {

                            getCmdBlock(x, y, z).setCommand("" + cmd_box.getText());
                            Level.playSound(x, y, z, "random.click", 100, 100);
                            di.dismiss();

                        }

                    });

                cmd_box.setText(getCmdBlock(x, y, z).cmd);
                var a = b.create();

                a.setOnDismissListener(new android.content.DialogInterface.OnDismissListener() {

                    onDismiss: function () {

                        cmdMessage("Command set: " + getCmdBlock(x, y, z).cmd);

                    }

                });

                a.show();

            } catch(e) {

                print(e);

            }

        }

    });

}

function getRandomEnt() {

    var i = Math.floor((Math.random() * ents.length) + 0);

    return ents[i];

}

function newLevel() {

    CB_FILE = new java.io.File(WORLDS + "/" + Level.getWorldDir(), "command_blocks.txt");

    if(!init) {

        initMod();
        init = true;

    }

    //ModPE.setItem(264, "Test", "command_block");
    /*if(ModPE.addCraftRecipe){

ModPE.addCraftRecipe(264, 64, 0, [3, 0]);

}*/

    if(!CB_FILE.exists()) {

        CB_FILE.createNewFile();

    }

    var dat = readFile(CB_FILE);
    var CB = dat.split("\n");

    for(var i = 0; i < CB.length; i++) {

        var cbdat = CB[i].split(":");
        var pos = cbdat[0].split("~");
        var x = pos[0];
        var y = pos[1];
        var z = pos[2];
        var command = cbdat[1];

        var commandblock = new cmdBlock(x, y, z);
        commandblock.setCommand(command);

        cb.push(commandblock);

    }

}

function leaveGame() {

    var fos = new java.io.FileOutputStream(CB_FILE);

    try {

        for(var i = 0; i < cb.length; i++) {

            var x = cb[i].x;
            var y = cb[i].y;
            var z = cb[i].z;
            var command = cb[i].cmd;
            var data = x + "~" + y + "~" + z + ":" + command;

            fos.write(new java.lang.String(data + "\n").getBytes());

        }

        fos.flush();
        fos.close();
        cb = [];

    } catch(e) {

        print(e);

    }

}

function cmdTrue(x, y, z) {

    if(Level.getTile(x + 1, y, z) == CMD_ID)
        if(!getCmdBlock(x + 1, y, z).startCommand());
    if(Level.getTile(x - 1, y, z) == CMD_ID)
        if(!getCmdBlock(x - 1, y, z).startCommand());
    if(Level.getTile(x, y, z + 1) == CMD_ID)
        if(!getCmdBlock(x, y, z + 1).startCommand());
    if(Level.getTile(x, y, z - 1) == CMD_ID)
        if(!getCmdBlock(x, y, z - 1).startCommand());
    if(Level.getTile(x, y + 1, z) == CMD_ID)
        if(!getCmdBlock(x, y + 1, z).startCommand());
    if(Level.getTile(x, y - 1, z) == CMD_ID)
        if(!getCmdBlock(x, y - 1, z).startCommand());

}

function useItem(x, y, z, itemId, blockId, side) {

    if(itemId == CMD_ID) {

        cb.push(new cmdBlock(x, y + 1, z));

    }

    if(blockId == CMD_ID && itemId != 280 && itemId != 331) {

        preventDefault();
        Level.playSound(x, y, z, "random.click", 100, 100);
        openCmdMenu(x, y, z);

    }

    if(blockId == CMD_ID && itemId == 280) {

        if(getCmdBlock(x, y, z).startCommand()) {

            //getCmdBlock(x, y, z).startCommand();
            cmdTrue(x, y, z);

        }

    }

    /*if(blockId == CMD_ID && itemId == 331){

if(getCmdBlock(x, y, z).looping){

getCmdBlock(x, y, z).setLooping(false);

}else if(!getCmdBlock(x, y, z).looping){

getCmdBlock(x, y, z).setLooping(true);

}

}*/

}

function destroyBlock(x, y, z) {

    if(Level.getTile(x, y, z) == CMD_ID) {

        preventDefault();
        Level.destroyBlock(x, y, z, true);

        if(cb.indexOf(getCmdBlock(x, y, z)) != -1) {

            cb.splice(cb.indexOf(getCmdBlock(x, y, z)), 1);

        }

    }

    if(Level.getTile(x, y, z) == LOOP_ID) {

        preventDefault();
        Level.destroyBlock(x, y, z, true);

    }

}

function fill(x, y, z, id, dmg) {

    var blid = Level.getTile(x, y, z);

    for(var i = x; i <= 256; i++) {

        if(Level.getTile(i, y, z) == blid) {

            Level.setTile(i, y, z, id, dmg);

        } else {

            break;

        }

    }

    for(var i = x; i >= 0; i--) {

        if(Level.getTile(i, y, z) == blid) {

            Level.setTile(i, y, z, id, dmg);

        } else {

            break;

        }

    }

    for(var i = z; i <= 256; i++) {

        if(Level.getTile(x, y, i) == blid) {

            Level.setTile(x, y, i, id, dmg);

        } else {

            break;

        }

    }

    for(var i = z; i >= 0; i--) {

        if(Level.getTile(x, y, i) == blid) {

            Level.setTile(x, y, i, id, dmg);

        } else {

            break;

        }

    }

    for(var i = y; i <= 128; i++) {

        if(Level.getTile(x, i, z) == blid) {

            Level.setTile(x, i, z, id, dmg);

        } else {

            break;

        }

    }

    for(var i = y; i >= 0; i--) {

        if(Level.getTile(x, i, z) == blid) {

            Level.setTile(x, i, z, id, dmg);

        } else {

            break;

        }

    }

}

if(!String.prototype.contains) {
    String.prototype.contains = function () {
        return String.prototype.indexOf.apply(this, arguments) !== -1;
    };
}

if(!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        }
    });
}

function procCmd(command, cx, cy, cz) {

    var cmd = command.split(" ");
	
	//Coordinates
	if(cmd[1]!=null)var relx = cmd[1].contains("~") ? parseInt(cx) + parseInt(cmd[1].replace(rel, "")) : parseInt(cmd[1]);
	if(cmd[2]!=null)var rely = cmd[2].contains("~") ? parseInt(cx) + parseInt(cmd[2].replace(rel, "")) : parseInt(cmd[2]);
	if(cmd[3]!=null)var relz = cmd[3].contains("~") ? parseInt(cx) + parseInt(cmd[3].replace(rel, "")) : parseInt(cmd[3])

    //command <required> [optional]

    //say <message>

    if(cmd[0] == "/say") {

        var msgdat = new java.lang.StringBuilder();

        for(var i = 1; i < cmd.length; i++) {

            msgdat.append(cmd[i]);
            msgdat.append(" ");

        }

        cmdMessage(msgdat.toString());

        return true;

    }

    //give <target> <id> [amount] [damage]

    if(cmd[0] == "/give") {

        if(cmd[1] == player) {

            Player.addItemInventory(cmd[2], cmd[3] != null ? cmd[3] : 1, cmd[4] != null ? cmd[4] : 0);

            return true;

        }

    }

    //setblock <x> <y> <z> <id> [damage]

    if(cmd[0] == "/setblock") {

        Level.setTile(cmd[1].contains("~") ? parseInt(cx) + parseInt(cmd[1].replace(rel, "")) : parseInt(cmd[1]), cmd[2].contains("~") ? parseInt(cy) + parseInt(cmd[2].replace(rel, "")) : parseInt(cmd[2]), cmd[3].contains("~") ? parseInt(cz) + parseInt(cmd[3].replace(rel, "")) : parseInt(cmd[3]), parseInt(cmd[4]), cmd[5] != null ? parseInt(cmd[5]) : 0);

        if(Level.getTile(cmd[1].contains("~") ? parseInt(cx) + parseInt(cmd[1].replace(rel, "")) : parseInt(cmd[1]), cmd[2].contains("~") ? parseInt(cy) + parseInt(cmd[2].replace(rel, "")) : parseInt(cmd[2]), cmd[3].contains("~") ? parseInt(cz) + parseInt(cmd[3].replace(rel, "")) : parseInt(cmd[3])) == parseInt(cmd[4])) {

            cmdMessage("Block is set");

            return true;

        } else {

            cmdMessage("Block is not set");

        }


        //clientMessage(cx/*+parseInt(cmd[1].replace(rel, ""))*/);

    }

    //tp <target> <x> <y> <z>

    if(cmd[0] == "/tp") {

        if(cmd[1] == player) {

            Entity.setPosition(Player.getEntity(), cmd[2].contains(rel) ? cx + parseInt(cmd[2].replace(rel, "")) : parseInt(cmd[2]), cmd[3].contains(rel) ? cy + parseInt(cmd[3].replace(rel, "")) : parseInt(cmd[3]), cmd[4].contains(rel) ? cz + parseInt(cmd[4].replace(rel, "")) : parseInt(cmd[4]));

            return true;

        }

        if(cmd[1] == random) {

            var ent = getRandomEnt();

            Entity.setPosition(ent, cmd[2].contains("~") ? Entity.getX(ent) + parseInt(cmd[2].replace(rel, "")) : parseInt(cmd[2]), cmd[3].contains(rel) ? Entity.getY(ent) + parseInt(cmd[3].replace(rel, "")) : parseInt(cmd[3]), cmd[4].contains(rel) ? Entity.getZ(ent) + parseInt(cmd[4].replace(rel, "")) : parseInt(cmd[4]));

            return true;

        }

        if(cmd[1] == all) {

            for(var i = 0; i < ents.length; i++) {

                var ent = ents[i];

                Entity.setPosition(ent, cmd[2].contains("~") ? Entity.getX(ent) + parseInt(cmd[2].replace(rel, "")) : parseInt(cmd[2]), cmd[3].contains(rel) ? Entity.getY(ent) + parseInt(cmd[3].replace(rel, "")) : parseInt(cmd[3]), cmd[4].contains(rel) ? Entity.getZ(ent) + parseInt(cmd[4].replace(rel, "")) : parseInt(cmd[4]));

                return true;

            }

        }

    }

    //time

    if(cmd[0] == "/time") {

        if(cmd[1] == "set") {

            if(!isNaN(parseInt(cmd[2]))) {

                Level.setTime(parseInt(cmd[2]));

                return true;

            } else if(cmd[2] == "day") {

                Level.setTime(0);

                return true;

            } else if(cmd[2] == "night") {

                Level.setTime(14000);

                return true;

            }

        }
		
		if(cmd[1] == "add"){
		
			Level.setTime(Level.getTime() + parseInt(cmd[2]));
		
		}

    }

	//gamemode <gamemode>
	
    if(cmd[0] == "/gamemode") {

        Level.setGameMode(parseInt(cmd[1]));

        return true;

    }

	//testfor <testforwhat?>
	
    if(cmd[0] == "/testfor") {

        if(cmd[1].startsWith("@p")) {

            var params = cmd[1].substring(cmd[1].indexOf("[") + 1, cmd[1].indexOf("]"));
            var param = params.split(",");

            for(var i = 0; i < param.length; i++) {

                var con = param[i].split("=");

                if(con[0] == health) {

                    if(Entity.getHealth(Player.getEntity()) == parseInt(con[1])) {

                        return true;

                    }

                }

                if(con[0] == "x") {

                    if(Math.round(Player.getX()) == parseInt(con[1])) {

                        return true;

                    }

                }

                if(con[0] == "y") {

                    if(Math.round(Player.getY()) == parseInt(con[1])) {

                        return true;

                    }

                }

                if(con[0] == "z") {

                    if(Math.round(Player.getZ()) == parseInt(con[1])) {

                        return true;

                    }

                }

                if(con[0] == "gm") {

                    if(Level.getGameMode() == parseInt(con[1])) {

                        return true;

                    }

                }

                if(con[0] == "t") {

                    if(Level.getTime() == parseInt(cmd[1])) {

                        return true;

                    }

                }

            }

        }

    }

	//testforblock <x> <y> <z> <id> [damage]
	
    if(cmd[0] == "/testforblock") {

        var x = cmd[1];
        var y = cmd[2];
        var z = cmd[3];
        var id = cmd[4];

        if(Level.getTile(x, y, z) == id) {

            return true;

        }

    }

	//kill [killwhat?]
	
    if(cmd[0] == "/kill") {

		if(cmd[0] == ""){
		
			Player.setHealth(0);
		
		}
	
        if(cmd[1] == "@p") {

            Entity.setHealth(Player.getEntity, 0);

        }

        if(cmd[1] == "@a") {

            for(var i = 0; i < ents.length; i++) {

                Entity.setHealth(ents[i], 0);

            }

        }

        if(cmd[1] == "@r") {

            Entity.setHealth(getRandomEnt(), 0);

        }

        return true;

    }

	//drop <x> <y> <z> <id> [amount] [damage]
	
    if(cmd[0] == "/drop") {

        Level.dropItem(cmd[1].contains("~") ? cx + parseInt(cmd[1].replace("~", "")) : parseInt(cmd[1]), cmd[2].contains("~") ? cy + parseInt(cmd[2].replace("~", "")) : parseInt(cmd[2]), cmd[3].contains("~") ? cz + parseInt(cmd[3].replace("~", "")) : parseInt(cmd[3]), cmd[6] != null ? parseInt(cmd[6]) : 0, parseInt(cmd[4]), cmd[5] != null ? parseInt(cmd[5]) : 1);

        return true;

    }

	//summon <x> <y> <z> <ent id> [skin]
	
    if(cmd[0] == "/summon") {

        Level.spawnMob(cmd[1].contains("~") ? cx + parseInt(cmd[1].replace("~", "")) : parseInt(cmd[1]), cmd[2].contains("~") ? cy + parseInt(cmd[2].replace("~", "")) : parseInt(cmd[2]), cmd[3].contains("~") ? cz + parseInt(cmd[3].replace("~", "")) : parseInt(cmd[3]), parseInt(cmd[4]), cmd[5] != null ? cmd[5] : null);

        return true;

    }

	//fill <x> <y> <z> <id> [damage]
	
    if(cmd[0] == "/fill") {

        var CURR_B = Level.getTile(parseInt(cmd[1]), parseInt(cmd[2]), parseInt(cmd[3]));

        fill(cmd[1].contains("~") ? parseInt(cx) + parseInt(cmd[1].replace(rel, "")) : parseInt(cmd[1]), cmd[2].contains("~") ? parseInt(cy) + parseInt(cmd[2].replace(rel, "")) : parseInt(cmd[2]), cmd[3].contains("~") ? parseInt(cz) + parseInt(cmd[3].replace(rel, "")) : parseInt(cmd[3]), parseInt(cmd[4]), cmd[5] != null ? parseInt(cmd[5]) : 0);

        return true;

    }

	//playsound <x> <y> <z> <sound> [volume] [pitch]
	
    if(cmd[0] == "/playsound") {

        Level.playSound(cmd[1].contains("~") ? parseInt(cx) + parseInt(cmd[1].replace(rel, "")) : parseInt(cmd[1]), cmd[2].contains("~") ? parseInt(cy) + parseInt(cmd[2].replace(rel, "")) : parseInt(cmd[2]), cmd[3].contains("~") ? parseInt(cz) + parseInt(cmd[3].replace(rel, "")) : parseInt(cmd[3]), cmd[4], cmd[5] != null ? parseInt(cmd[5]) : 100, cmd[6] != null ? parseInt(cmd[6]) : 100);

        return true;

    }

	//setworldspawn <x> <y> <z>
	
	if(cmd[0] == "/setworldspawn"){
	
		Level.setSpawn(relx, rely, relz);
		return true;
	
	}
	
	//clear <item> <damage> <maxAmount>
	
	if(cmd[0] == "/clear"){
	
		Player.addItemInventory(parseInt(cmd[1]), 0-parseInt(cmd[3]), parseInt[2]);
		return true;
	
	}
	
}

function entityAddedHook(ent) {

    ents.push(ent);

}

function entityRemovedHook(ent) {

    if(ents.indexOf(ent) != -1) {

        ents.splice(ents.indexOf(ent));

    }

}

function nearLooper(x, y, z) {

    if(Level.getTile(x + 1, y, z) == LOOP_ID) return true;
    if(Level.getTile(x - 1, y, z) == LOOP_ID) return true;
    if(Level.getTile(x, y, z + 1) == LOOP_ID) return true;
    if(Level.getTile(x, y, z - 1) == LOOP_ID) return true;
    if(Level.getTile(x, y + 1, z) == LOOP_ID) return true;
    if(Level.getTile(x, y - 1, z) == LOOP_ID) return true;
    else return false;

}

function modTick() {

    for(var i = 0; i < cb.length; i++) {

        var c = cb[i];

        if(nearLooper(c.getX(), c.getY(), c.getZ())) {

            c.setLooping(true);

        } else {

            c.setLooping(false);

        }

        if(c.looping) {

            if(c.startCommand()) {

                cmdTrue(c.getX(), c.getY(), c.getZ());

            }

        }

    }

}