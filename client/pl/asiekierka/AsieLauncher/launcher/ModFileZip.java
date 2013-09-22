package pl.asiekierka.AsieLauncher.launcher;

import java.io.*;

import org.json.simple.*;

import pl.asiekierka.AsieLauncher.common.Utils;

public class ModFileZip extends ModFileHTTP {
	public String directory, installDirectory;
	
	public ModFileZip(AsieLauncher _launcher, JSONObject data, String prefix) {
		super(_launcher, data, prefix);
		absoluteFilename = launcher.directory + prefix + (String)information.get("filename");
		file = new File(absoluteFilename);
		installDirectory = (String)data.get("directory");
		directory = launcher.directory + installDirectory;
	}
	@Override
	public boolean install(IProgressUpdater updater) {
		boolean downloaded = super.install(updater, true);
    	if(!downloaded) return false;
    	File dirFile = new File(directory);
    	dirFile.mkdir();
		updater.setStatus(Strings.UNPACKING+" "+this.getFilename()+"...");
    	try {
    		Utils.extract(absoluteFilename, directory, this.isOverwrite());
    	} catch(Exception e) { e.printStackTrace(); return false; }
    	return true;
	}

	@Override
	public boolean remove() {
		return true; // DUMMY! We can't really figure out what we removed, besides, users might have touched it.
	}
}