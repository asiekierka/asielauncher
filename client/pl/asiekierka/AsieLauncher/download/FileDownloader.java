package pl.asiekierka.AsieLauncher.download;

import java.io.*;

import org.json.simple.*;

import pl.asiekierka.AsieLauncher.common.IProgressUpdater;
import pl.asiekierka.AsieLauncher.common.Utils;

public abstract class FileDownloader {
	private String filename, md5;
	protected String absoluteFilename;
	protected File file;
	protected JSONObject information;
	private int filesize;
	private boolean overwrite;
	
	public FileDownloader(String baseDirectory, JSONObject data, String prefix) {
		information = data;
		filename = (String)information.get("filename");
		md5 = (String)data.get("md5");
		Long longFilesize = (Long)(information.get("size"));
		filesize = longFilesize.intValue();
		absoluteFilename = baseDirectory + (String)information.get("filename");
		file = new File(absoluteFilename);
		overwrite = information.containsKey("overwrite")
					? (Boolean)(information.get("overwrite"))
					: true;
	}
	
	public String getMD5() {
		return md5;
	}

	public File getFile() {
		return file;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public int getFilesize() {
		return filesize;
	}

	public boolean isOverwrite() {
		return overwrite;
	}

	public abstract boolean install(IProgressUpdater updater);
	public abstract boolean remove();
	
	public boolean shouldDownload() {
		if(file.exists()) {
			if(!overwrite) return false;
			try {
				String fileMD5 = Utils.md5(file);
				System.out.println("Comparison: "+md5+" "+fileMD5);
				if(fileMD5.equalsIgnoreCase(md5)) {
					return false;
				}
			} catch(Exception e) { /* Can be ignored. */ }
		}
		return true;
	}
	public void createDirsIfMissing() {
		File path = new File(file.getParentFile().getPath());
		path.mkdirs();
	}
	
	@Override
	public boolean equals(Object other) {
		if(other == null || !(other instanceof FileDownloader)) return false;
		FileDownloader mother = (FileDownloader)other;
		return mother.filename.equals(filename);
    }
	
	@Override
	public int hashCode() {
		return filename.hashCode();
	}
}