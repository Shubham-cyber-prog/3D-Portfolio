export const hologramVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    
    vec3 pos = position;
    float wave = sin(position.y * 5.0 + uTime * 2.0) * 0.05;
    pos.x += wave;
    pos.z += wave;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const hologramFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform vec3 uColor;
  
  void main() {
    vec3 normal = normalize(vNormal);
    
    float fresnel = pow(1.0 - abs(dot(normal, vec3(0.0, 0.0, 1.0))), 2.0);
    
    float scanline = sin(vPosition.y * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    float glitch = step(0.95, sin(vPosition.y * 100.0 + uTime * 10.0));
    
    vec3 color = uColor;
    color += fresnel * 0.8;
    color *= scanline * 0.3 + 0.7;
    color += glitch * 0.5;
    
    float alpha = fresnel * 0.8 + 0.2;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
