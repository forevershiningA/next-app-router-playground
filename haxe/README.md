# Engine3D

## 1. License

TODO

## 2. Development environment

This chapter describes the configuration of the development environment, which is necessary for the correct compilation of the Engine3D project. The project was written in the `Haxe` language and is compiled for the Web platform (target is `JavaScript`).

### 2.1. Haxe installation

To be able to compile Engine3D, the `Haxe` compiler must be installed along with the necessary libraries. It is also necessary to link some libraries from outside the central `haxelib` repository, so that the compiler can use them.

The current version of Engine3D has been tested to work properly with compiler version `4.2.5`. Due to major changes in the `Haxe` language itself, using a different version may require changes in the code and the use of other versions of the `openfl` and `lime` libraries. It should be noted that Engine3D uses a modified version of the `openfl` library (the version from the central repository is not used), as some OpenFL objects are required to be exposed by the Engine API. In this case, changing the version of OpenFL is problematic because it requires modifying the library again. At the time of writing this documentation, `Haxe 4.2.5` is the latest version of the compiler.

> It is not recommended to use a version other than `Haxe 4.2.5`

#### 2.1.1. Haxe compiler

Please download and install `Haxe 4.2.5` using the website:
https://haxe.org/download/

#### 2.1.2. Central repo libraries

After installing Haxe, you need to install the libraries from the main haxe repository. Open a terminal and use the commands below:

```cmd
haxelib install closure
haxelib install dox
haxelib install gsap
haxelib install box2d
haxelib install lime 8.0.0
```

> The `lime` library should be version `8.0.0` because it is compatible with `Haxe 4.2.5`. Other version may not be compatible.

> The rest of the libraries may be in the latest versions.

#### 2.1.3. Connecting additional libraries (without a central repo)

Open a terminal and use the commands below:

```cmd
haxelib dev engine3d-api "<source_path>\source_api"
haxelib dev away3d "<source_path>\api_libs\away3d-5.0.9"
haxelib dev openfl "<source_path>\api_libs\openfl-9.2.0"
```

> Replace `<source_path>` with the real source code path.

### 2.2. Ant build tool installation

Engine3D uses the Ant tool to build the project automatically.

#### 2.2.1. Java

Ant is a tool written in java, therefore, Java JDK (not JRE!) is required. Any Java JDK implementation can be installed (minimum version 8), however it is recommended to install the Amazon Corretto implementation due to no licensing issues. Amazon Corretto Java JDK download link: https://docs.aws.amazon.com/corretto/latest/corretto-8-ug/downloads-list.html

#### 2.2.2 Ant

It is recommended to install the latest version of Apache Ant from the official site: https://ant.apache.org/bindownload.cgi.

- Download Ant `.zip` or `.tar.gz` file.
- Uncompress the downloaded file into a directory.
- Set environmental variables: `JAVA_HOME` to your Java environment, `ANT_HOME` to the directory you uncompressed Ant to, and add `${ANT_HOME}/bin` (Unix) or `%ANT_HOME%\bin` (Windows) to your `PATH`. 

### 2.3. Obfuctator tool

To properly compile Engine3D, it is required to install the JS code obfuscation tool named `javascript-obfuscator`. The obfuscation tool is an `npm` module running on `nodejs`, so nodejs is also required to be installed.

Installation:
- Download and install last LTS (or newest) version of nodejs from site: https://nodejs.org/en/. It is important to install the `npm` package manager along with nodejs.
- Install obfuscator using command:
```cmd
npm install -g javascript-obfuscator
```

### 2.4. IDE

The recommended IDE is **Haxe Develop** because the project is run with this tool.

Download link: https://github.com/HaxeFoundation/haxedevelop.org/releases

Files with the `*.hxproj` extension are the main project files, e.g.:
- **Engine3D Main**: `\source\Engine3D.hxproj`
- **Engine3D API**: `\source_api\Engine3DAPI.hxproj`
- etc.

## 3. Compilation

After the correct installation of Haxe and the required libraries and tools, you can start compiling the engine.

The engine can be compiled in three modes:

| Mode | Description |
| ----------- | ----------- |
| Distribution | This mode is used to compile the **production version** of Engine3D. The production version is obfuscated and protected against decompilation and changes in the code, so it is <font color="red">**very important to use only this version of the engine on a publicly available website!**</font> |
| Release | Compilation mode that generates a version similar to distribution, but without obfuscation and security. Compilation in this mode is much faster than in distribution mode. This mode can be considered pre-production for compiling frequent changes. |
| Debug  | Compilation in this mode is useful for debugging purposes. A map is created between the Haxe language and the compiled JavaScript code, which makes it easier to analyze the code in the browser. |

The compilation should be run by executing the ant build script from `\source` folder:
```cmd
cd source
ant <mode>
```

Examples:
```cmd
ant distribution
ant release
ant debug
```

The result of compiling the distribution version will be visible in the `\distribution` directory. The compilation result of the release and debug versions will be available in the directory `\source\bin\html5\bin`. Release and debug versions can be compiled directly from the `Haxe Develop IDE` after running the main project file: `\source\Engine3D.hxproj`.

> Is very important to use only `distribution` version of the engine on a publicly available website!

## 4. Engine code structure

## 4.1 Source code

The Engine3D source code is in the directory `/source/src`. The main project files are in the package `pl.pkapusta.engine`.

Main packages:

| Package | Description |
| ----------- | ----------- |
| pl.pkapusta.engine.common | General interfaces and implementations used throughout the project, e.g. parser interfaces, mvc patterns, etc. |
| pl.pkapusta.engine.events | Global events sent inside the engine |
| pl.pkapusta.engine.globals | Implementation of global settings |
| pl.pkapusta.engine.graphics | Implementations of general graphics structures and algorithms used in the engine
| pl.pkapusta.engine.model | Implementation of support for 3d models, controlling their state, loading, removing from the scene and connecting the implementation of models with the engine. |
| pl.pkapusta.engine.project | Implementation of 3d project support, loading, saving and managing the structure |
| pl.pkapusta.engine.swc | Dependencies required at compile time (so the compiler doesn't cut some implementations).
| pl.pkapusta.engine.utils | Implementation of some general utils used in the engine |
| pl.pkapusta.engine.view | Implementation of the 3d view, camera management and changing its states |

The detailed structure, list of all objects and their functions is available in the reference documentation:

Please visit `/distribution/doc/haxe-reference/index.html` file.

## 4.2 Objects available from the JS level

Below is a list of objects available from the JavaScript level. These objects are used to control Engine3D. A detailed list of functions and arguments for each object can be found in the reference documentation available here: `/distribution/doc/haxe-reference/index.html`.

| JS Object <br /> *Source code object* | Description |
| ----------- | ----------- |
| Engine3D.Globals <br /> *pl.pkapusta.engine.globals.Globals* | Global engine settings initialized before starting the 3d scene.
| Engine3D.View <br /> *pl.pkapusta.engine.Engine3DView* | Main 3D View and camera control for Engine 3D. Rendering a scene to an image.
| Engine3D.Controller <br /> *pl.pkapusta.engine.Engine3DController* | Main Engine 3D Controller object instance. Creating, loading, saving projects.
| Engine3D.ExceptionManager <br /> *pl.pkapusta.engine.common.exteption.ExceptionManager* | Exception manager for mainly cast exceptions. The ability to catch general errors and specify behavior in specific cases.
| Engine3D.Model3D <br /> *pl.pkapusta.engine.model.Model3D* | The main object defining the 3d model available in the scene. This object is used to load M3D, manage the states and properties of the 3d model that is displayed on the stage. |
| Engine3D.Model3DEditUtility <br /> *pl.pkapusta.engine.utils.Model3DEditUtility* | Auxiliary tools for managing Model3d objects. |
| Engine3D.ModelInfoType <br /> *pl.pkapusta.engine.model.ModelInfoType* | Static variables specifying the type of information returned by the 3d model. |
| Engine3D.project.triggers.BaseUrlLoadTrigger <br /> *pl.pkapusta.engine.project.data.triggers.BaseUrlLoadTrigger* | Programmable trigger for solving dependencies when loading a scene. |
| Engine3D.project.ProjectContext <br /> *pl.pkapusta.engine.project.data.ProjectContext* | Context used when loading the scene |
| Engine3D.project.ProjectSaveCustomizator <br /> *pl.pkapusta.engine.project.data.ProjectSaveCustomizator* | An object used to define the parameters of the saved scene. |
| Engine3D.AbstractSelection<br />Engine3D.StandardSelection<br />Engine3D.SurfaceSelection <br /> *pl.pkapusta.engine.model.selection.\** | Objects describing element selection returned by model3d if it is selected. Abstract is a generic object, Standard defines a cubic selection, Surface defines the selection of a flat object, e.g. text pinned to a headstone. |
| Engine3D.values.BitmapTextureValue <br /> *pl.pkapusta.engine.model.properties.values.BitmapTextureValue* | Stores the loaded texture in memory |
| Engine3D.values.ByteArrayValue <br /> *pl.pkapusta.engine.model.properties.values.ByteArrayValue* | Stores general data in memory. Sometimes this data can be a texture encoded in a custom format. |
| Engine3D.values.DisplayObjectValue <br /> *pl.pkapusta.engine.model.properties.values.DisplayObjectValue* | Holds a DisplayObject in memory to be rendered on the model. DisplayObject was the object used in the DYO Flash version. Currently, DisplayObject support is limited to very simple swf files. Not every file will work properly. |
| Engine3D.values.TextureValue <br /> *pl.pkapusta.engine.model.properties.values.TextureValue* | An abstract object that stores a texture. It is overwritten with a specific implementation, e.g. BitmapTextureValue. |
| Engine3D.utils.BitmapLoader <br /> *pl.pkapusta.engine.common.utils.loaders.BitmapLoader* | Auxiliary object used to load the bitmap to the format supported by the engine and openfl. |
| Engine3D.utils.DisplayObjectLoader <br /> *pl.pkapusta.engine.common.utils.loaders.DisplayObjectLoader* | Auxiliary object used to load the swf file to the DisplayObject format supported by the engine and openfl. |
| Engine3D.utils.RenderToImageParams <br /> *pl.pkapusta.engine.view.data.RenderToImageParams* | An object that defines the parameters of the scene to be drawn on the saved image. |
| Engine3D.utils.JPEGEncoderOptions<br />Engine3D.utils.PNGEncoderOptions <br /> *pl.pkapusta.engine.view.data.\*EncoderOptions* | Objects defining the parameters of encoding the saved scene to the image. |



## 4.3 Test builds

Test builds and files are in the directory `\source\bin\html5\bin`. This directory contains a test website that can be used to test the engine. The server with the website starts with the first compilation of the engine from the `Haxe Develop` environment. You have to remember to run and use the `index2.html` file because index.html is overwritten with each compilation and does not contain anything. The `Main.js` file contains implementations for using various engine functions.

