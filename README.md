# Walkers
This was my old [submission for blot](https://blot.hackclub.com/editor?src=https://raw.githubusercontent.com/hackclub/blot/main/art/Walkers-ChristopherBody/index.js), reimagined and recoded: First using p5js (CPU), then ported to run on the gpu using webgl.
It works essentially as a kind of physics simulation. You define a 3d mathematical surface (or SDF), and the simulated 'walkers' walk down the slope.

For an example of this, you can view a surface here:
https://www.desmos.com/3d/xkddysguta
And if you replace the sdf function in [Walkers GPU](https://cookiemonsternz.github.io/walkersGPU/) with this:
```
float sdf(vec2 pos) {
    float scale = 30.0;
    return sin(pos.x * scale) + cos(pos.y * scale);
}
```
You can see how the walkers traverse from the peaks (the dark areas) to the valleys.

## Links
 - [Walkers GPU](https://cookiemonsternz.github.io/walkersGPU/) - The GPU Port
 - [Walkers CPU](https://cookiemonsternz.github.io/walkersCPU/) - Original rewritten p5js code (CPU)
 - [Walkers Auto](https://cookiemonsternz.github.io/auto/) - p5js code (CPU) which automatically cycles through different sdf functions and color schemes
## Running Locally
To run locally:

- Clone or download the repo
- Run the project with some form of server (I use [Five Server](https://marketplace.visualstudio.com/items?itemName=yandeu.five-server))
- Navigate to [https://{ip}/walkersGPU/]()

## Images
![image](https://github.com/user-attachments/assets/b0ade7de-4d8e-4ca6-af72-0d3d0e0d9889)
![image](https://github.com/user-attachments/assets/91130cbb-5c57-489d-82ec-adb446e670fd)
![image](https://github.com/user-attachments/assets/a178a278-ae3a-491b-be34-1081713dfd39)
![image](https://github.com/user-attachments/assets/27bb8295-9c15-414c-acf0-0beebc33b61f)
![image](https://github.com/user-attachments/assets/fc51cdc6-7819-49d9-ad78-a6c1598ec9b0)
![image](https://github.com/user-attachments/assets/04b22b71-6492-4efc-99e9-23959824e33f)
