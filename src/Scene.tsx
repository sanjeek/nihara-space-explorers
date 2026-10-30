import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { store, useSave } from "./state";
import { worlds, type Mission } from "./missions";
import { sound } from "./audio";
const material = { roughness: 0.6, metalness: 0.1 };
function Sphere({
  position = [0, 0, 0],
  scale = 1,
  color = "#c1a6ee",
}: {
  position?: [number, number, number];
  scale?: number | [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={color} {...material} />
    </mesh>
  );
}
export function Rocket({
  color,
  fin = "round",
  sticker = "⭐",
}: {
  color: string;
  fin?: string;
  sticker?: string;
}) {
  const decal = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    const x = c.getContext("2d")!;
    x.font = "90px sans-serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(sticker, 64, 64);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [sticker]);
  useEffect(() => () => decal.dispose(), [decal]);
  return (
    <group rotation={[0, 0, -0.23]}>
      <Sphere scale={[0.72, 1.4, 0.72]} color={color} />
      <mesh position={[0, 1.15, 0]}>
        <coneGeometry args={[0.59, 1, 24]} />
        <meshStandardMaterial color="#f8e8dc" />
      </mesh>
      <Sphere
        position={[0, 0.35, 0.64]}
        scale={[0.39, 0.39, 0.13]}
        color="#f7ebdc"
      />
      <Sphere
        position={[0, 0.35, 0.77]}
        scale={[0.28, 0.28, 0.06]}
        color="#76cfdf"
      />
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.74, -0.75, 0]}
          rotation={[0, 0, s * -0.4]}
        >
          <coneGeometry
            args={[
              fin === "pointy" ? 0.45 : 0.32,
              1.3,
              fin === "pointy" ? 3 : 12,
            ]}
          />
          <meshStandardMaterial color="#edb577" />
        </mesh>
      ))}
      <mesh position={[0, -0.55, 0.72]}>
        <planeGeometry args={[0.45, 0.45]} />
        <meshBasicMaterial map={decal} transparent />
      </mesh>
      <Sphere
        position={[0, -1.53, 0]}
        scale={[0.36, 0.65, 0.36]}
        color="#f7c66b"
      />
      <Sphere
        position={[0, -1.65, 0.1]}
        scale={[0.2, 0.45, 0.2]}
        color="#ffedd5"
      />
    </group>
  );
}
function Astronaut({ color }: { color: string }) {
  return (
    <group>
      <Sphere position={[0, 0.55, 0]} scale={[0.4, 0.5, 0.3]} color={color} />
      <Sphere position={[0, 1.24, 0]} scale={0.48} color="#f0f0ec" />
      <Sphere
        position={[0, 1.25, 0.36]}
        scale={[0.34, 0.28, 0.16]}
        color="#607ca5"
      />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Sphere
            position={[s * 0.43, 0.6, 0]}
            scale={[0.15, 0.35, 0.16]}
            color="#ebe5da"
          />
          <Sphere
            position={[s * 0.22, 0.12, 0.08]}
            scale={[0.2, 0.2, 0.29]}
            color={color}
          />
        </group>
      ))}
      <Sphere
        position={[0, 0.7, -0.3]}
        scale={[0.3, 0.4, 0.2]}
        color="#c8cbd2"
      />
    </group>
  );
}
function Alien() {
  return (
    <group>
      <Sphere scale={[0.6, 0.7, 0.5]} color="#89d7bc" />
      <Sphere
        position={[0, 0.65, 0]}
        scale={[0.7, 0.52, 0.5]}
        color="#89d7bc"
      />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Sphere
            position={[s * 0.25, 0.7, 0.43]}
            scale={[0.13, 0.18, 0.08]}
            color="#354459"
          />
          <Sphere position={[s * 0.22, 0.74, 0.5]} scale={0.04} color="white" />
          <Sphere position={[s * 0.4, 1.15, 0]} scale={0.12} color="#d1a3dc" />
        </group>
      ))}
    </group>
  );
}
function SpaceStars() {
  const positions = useMemo(
    () =>
      Float32Array.from(
        Array.from({ length: 420 }, (_, i) => Math.sin(i * 127.1) * 38),
      ),
    [],
  );
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.09} color="#e5dffb" sizeAttenuation />
    </points>
  );
}
function Planet({ world = 0 }: { world?: number }) {
  return (
    <group>
      <Sphere
        color={world === 0 ? "#6497c8" : worlds[world].color}
        scale={2.5}
      />
      {world === 0 &&
        [
          [0, 2, 1.4],
          [-1, 1, 2.1],
          [1.3, -0.9, 1.9],
          [-1.5, -1, 1.5],
        ].map((p, i) => (
          <Sphere
            key={i}
            position={p as [number, number, number]}
            scale={[0.8, 0.5, 0.3]}
            color="#90bfaa"
          />
        ))}
      {world >= 2 && (
        <mesh rotation={[1.1, 0.1, 0.1]}>
          <torusGeometry args={[3.35, 0.19, 8, 64]} />
          <meshStandardMaterial color="#e6c99f" />
        </mesh>
      )}
    </group>
  );
}
function HomeWorld() {
  const { settings, profiles, active } = useSave();
  const p = profiles.find((v) => v.id === active)!;
  return (
    <>
      <SpaceStars />
      <group position={[1, 0, 0]}>
        <Float
          speed={settings.reducedMotion ? 0 : 1.5}
          rotationIntensity={0.13}
          floatIntensity={0.4}
        >
          <group position={[1.5, 0.15, 0]} rotation={[0.15, 0, -0.25]}>
            <Rocket color={p.colour} fin={p.fin} sticker={p.sticker} />
          </group>
        </Float>
        <group position={[-2, -1, -2]} rotation={[0.2, 0.3, -0.2]}>
          <Planet />
        </group>
        <Float speed={settings.reducedMotion ? 0 : 1} floatIntensity={0.3}>
          <group position={[3, -1, -1]} scale={0.6}>
            <Alien />
          </group>
        </Float>
      </group>
    </>
  );
}
const held = new Set<string>();
export function controlKey(key: string, down: boolean) {
  down ? held.add(key) : held.delete(key);
}
function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(
          e.code,
        )
      )
        e.preventDefault();
      held.add(e.code);
    };
    const up = (e: KeyboardEvent) => held.delete(e.code);
    const clear = () => held.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      held.clear();
    };
  }, []);
}
type Props = {
  mission?: Mission;
  onProgress?: (n: number) => void;
  onComplete?: () => void;
  paused?: boolean;
};
declare global {
  interface Window {
    __space?: {
      position: number[];
      targets: number[][];
      collected: number;
      collectedIndices: number[];
      completed: boolean;
      mode: string;
      misses: number;
      view?: { position: number[]; fov: number };
    };
  }
}
function PlayWorld({
  mission: m,
  onProgress,
  onComplete,
  paused,
}: Props & { mission: Mission }) {
  const player = useRef<THREE.Group>(null!);
  const objects = useRef<(THREE.Group | null)[]>([]);
  const asteroids = useRef<(THREE.Group | null)[]>([]);
  const bumped = useRef(new Set<number>());
  const missed = useRef(new Set<number>());
  const progress = useRef(0),
    done = useRef(false),
    misses = useRef(0),
    time = useRef(0),
    slow = useRef(0);
  const collected = useRef(new Set<number>());
  const goal = useRef(new THREE.Vector3(0, 0, 5));
  const flight = m.mode === "flight";
  const { camera, gl, size } = useThree();
  const pointer = useRef(new THREE.Vector2());
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const targets = useMemo(
    () =>
      Array.from({ length: flight ? m.target + 2 : m.target }, (_, i) =>
        flight
          ? new THREE.Vector3(
              [-3.5, 0, 3.5, 0][i % 4],
              2 + (i % 3) * 1.4,
              -8 - i * 10,
            )
          : new THREE.Vector3(
              ...([
                [-4, 0.65, 3],
                [3, 0.65, 1],
                [-3, 0.65, -3],
                [5, 0.65, -4],
                [-7, 0.65, -5],
                [0, 0.65, 3],
                [7, 0.65, 3],
              ][i] as [number, number, number]),
            ),
      ),
    [m.id],
  );
  useKeyboard();
  useEffect(() => {
    const aspect = size.width / size.height;
    const zoom = Math.max(1, 0.95 / aspect);
    camera.position.set(
      ...((flight
        ? [0, 5, 14 + Math.max(0, 1 / aspect - 1) * 12]
        : [0, 13 * zoom, 17 * zoom]) as [number, number, number]),
    );
    camera.lookAt(0, flight ? 2 : 0, flight ? -8 : 0);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = flight ? 55 : 45;
      camera.updateProjectionMatrix();
    }
  }, [m.id, size.width, size.height]);
  useEffect(() => {
    player.current.position.set(0, flight ? 3 : 0, 5);
    goal.current.set(0, flight ? 3 : 0, 5);
    window.__space = {
      position: player.current.position.toArray(),
      targets: targets.map((v) => v.toArray()),
      collected: 0,
      collectedIndices: [],
      completed: false,
      mode: m.mode,
      misses: 0,
    };
  }, [m.id]);
  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (paused || done.current) return;
      const rect = gl.domElement.getBoundingClientRect();
      pointer.current.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      if (flight) {
        goal.current.set(
          pointer.current.x * 6,
          THREE.MathUtils.clamp(3 + pointer.current.y * 3, 1, 7),
          5,
        );
      } else {
        ray.setFromCamera(pointer.current, camera);
        const hit = new THREE.Vector3();
        if (
          ray.ray.intersectPlane(
            new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
            hit,
          )
        )
          goal.current.set(
            THREE.MathUtils.clamp(hit.x, -10, 10),
            0,
            THREE.MathUtils.clamp(hit.z, -8, 8),
          );
      }
    };
    const drag = (event: PointerEvent) => {
      if (event.buttons || event.pointerType === "touch") move(event);
    };
    gl.domElement.addEventListener("pointerdown", move);
    gl.domElement.addEventListener("pointermove", drag);
    return () => {
      gl.domElement.removeEventListener("pointerdown", move);
      gl.domElement.removeEventListener("pointermove", drag);
    };
  }, [m.id, paused]);
  useFrame((_, delta) => {
    if (paused || done.current || !player.current) return;
    const dt = Math.min(delta, 0.05);
    time.current += dt;
    const p = player.current.position;
    const dx =
        (held.has("KeyD") || held.has("ArrowRight") ? 1 : 0) -
        (held.has("KeyA") || held.has("ArrowLeft") ? 1 : 0),
      dy =
        (held.has("KeyW") || held.has("ArrowUp") ? 1 : 0) -
        (held.has("KeyS") || held.has("ArrowDown") ? 1 : 0);
    if (flight) {
      if (dx || dy) {
        goal.current.x = THREE.MathUtils.clamp(
          goal.current.x + dx * 7 * dt,
          -6,
          6,
        );
        goal.current.y = THREE.MathUtils.clamp(
          goal.current.y + dy * 7 * dt,
          1,
          7,
        );
      }
      p.x = THREE.MathUtils.damp(p.x, goal.current.x, 7, dt);
      p.y = THREE.MathUtils.damp(p.y, goal.current.y, 7, dt);
      player.current.rotation.z = (goal.current.x - p.x) * -0.12;
      targets.forEach((v, i) => {
        v.z += dt * (slow.current > 0 ? 3 : 7 + m.world);
        if (objects.current[i]) objects.current[i]!.position.copy(v);
        if (v.z >= 4.2 && v.z < 6.5 && !collected.current.has(i)) {
          const near = Math.hypot(v.x - p.x, v.y - p.y);
          if (
            near < 1.8 ||
            (store.get().settings.assistance &&
              misses.current >= 3 &&
              near < 3.8)
          ) {
            collected.current.add(i);
            objects.current[i]!.visible = false;
            progress.current++;
            sound("star");
            onProgress?.(progress.current);
          } else if (v.z > 6 && !missed.current.has(i)) {
            missed.current.add(i);
            misses.current++;
            sound("bump");
            slow.current = 1;
          }
        }
        const rock = asteroids.current[i];
        if (rock) {
          rock.position.set(v.x > 0 ? -2.5 : 2.5, 2.7, v.z + 4.5);
          if (
            !bumped.current.has(i) &&
            Math.abs(rock.position.z - p.z) < 1 &&
            Math.hypot(rock.position.x - p.x, rock.position.y - p.y) < 1.15
          ) {
            bumped.current.add(i);
            slow.current = 1.2;
            p.x = THREE.MathUtils.clamp(p.x + 0.25, -6, 6);
            sound("bump");
          }
        }
        if (v.z > 10) {
          v.z -= targets.length * 10;
          collected.current.delete(i);
          bumped.current.delete(i);
          missed.current.delete(i);
          if (objects.current[i]) objects.current[i]!.visible = true;
        }
      });
      slow.current = Math.max(0, slow.current - dt);
    } else {
      if (dx || dy)
        goal.current.set(
          THREE.MathUtils.clamp(p.x + dx * 4 * dt, -10, 10),
          0,
          THREE.MathUtils.clamp(p.z - dy * 4 * dt, -8, 8),
        );
      const diff = goal.current.clone().sub(p);
      if (diff.length() > 0.08) {
        const step = Math.min(diff.length(), dt * 4);
        p.add(diff.normalize().multiplyScalar(step));
        player.current.rotation.y = Math.atan2(diff.x, diff.z);
      }
      targets.forEach((v, i) => {
        if (!collected.current.has(i) && p.distanceTo(v) < 1.25) {
          collected.current.add(i);
          objects.current[i]!.visible = false;
          progress.current++;
          sound("star");
          onProgress?.(progress.current);
        }
      });
    }
    if (
      progress.current >= m.target &&
      (flight || Math.hypot(p.x, p.z + 6) < 1.7)
    ) {
      done.current = true;
      onComplete?.();
    }
    window.__space = {
      position: p.toArray(),
      targets: targets.map((v) => v.toArray()),
      collected: progress.current,
      collectedIndices: [...collected.current],
      completed: done.current,
      mode: m.mode,
      misses: misses.current,
      view: {
        position: camera.position.toArray(),
        fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : 45,
      },
    };
  });
  return (
    <>
      <SpaceStars />
      {flight ? (
        <group position={[12, 2, -25]}>
          <Planet world={m.world} />
        </group>
      ) : (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <circleGeometry args={[15, 64]} />
            <meshStandardMaterial color={worlds[m.world].ground} />
          </mesh>
          {Array.from({ length: 12 }, (_, i) => (
            <Sphere
              key={i}
              position={[Math.sin(i * 2.1) * 11, 0.1, Math.cos(i * 2.1) * 9]}
              scale={[0.5 + (i % 3) * 0.2, 0.3, 0.65]}
              color={worlds[m.world].color}
            />
          ))}
          <group position={[0, 0.7, -6]}>
            <Float speed={0.8} floatIntensity={0.12}>
              <Alien />
            </Float>
          </group>
          <mesh position={[0, 0.05, -6]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.3, 0.07, 8, 32]} />
            <meshStandardMaterial
              color="#a0e5b6"
              emissive="#91e5ac"
              emissiveIntensity={0.3}
            />
          </mesh>
        </>
      )}
      <group ref={player} scale={flight ? 0.6 : 0.7}>
        {flight ? (
          <group rotation={[-Math.PI / 2, 0, 0]}>
            <Rocket
              color={store.profile().colour}
              fin={store.profile().fin}
              sticker={store.profile().sticker}
            />
          </group>
        ) : (
          <Astronaut color={store.profile().suit} />
        )}
      </group>
      {flight &&
        targets.map((v, i) => (
          <group
            key={"rock" + i}
            ref={(el) => {
              asteroids.current[i] = el;
            }}
            position={[v.x > 0 ? -2.5 : 2.5, 2.7, v.z + 4.5]}
          >
            <mesh rotation={[i, 0.3, 0.6]}>
              <dodecahedronGeometry args={[0.65, 0]} />
              <meshStandardMaterial color="#8d82a6" roughness={1} />
            </mesh>
          </group>
        ))}
      {targets.map((v, i) => (
        <group
          key={i}
          ref={(el) => {
            objects.current[i] = el;
          }}
          position={v}
        >
          {flight ? (
            <>
              <mesh>
                <torusGeometry args={[1.65, 0.1, 8, 40]} />
                <meshStandardMaterial
                  color="#eaca83"
                  emissive="#f4b952"
                  emissiveIntensity={0.6}
                />
              </mesh>
              <Sphere scale={0.22} color="#f6d78c" />
            </>
          ) : (
            <mesh rotation={[0, 0.4, 0]}>
              <octahedronGeometry args={[0.43]} />
              <meshStandardMaterial
                color="#ffdc8d"
                emissive="#ffc85e"
                emissiveIntensity={0.3}
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}
class GraphicsBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="graphics-error">
        🪐<h2>Let’s get your universe ready</h2>
        <p>
          This browser could not start 3D graphics. Try updated Chrome, Edge, or
          Safari with graphics acceleration enabled.
        </p>
        <button onClick={() => location.reload()}>Try again</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function Scene(props: Props) {
  const { settings } = useSave();
  const [lost, setLost] = useState(false);
  if (lost)
    return (
      <div className="graphics-error">
        <h2>Our spaceship needs a moment</h2>
        <p>3D graphics stopped. Your saved mission progress is safe.</p>
        <button onClick={() => location.reload()}>Reload</button>
      </div>
    );
  return (
    <GraphicsBoundary>
      <Canvas
        dpr={settings.quality === "low" ? 1 : [1, 1.5]}
        camera={{ position: [0, 3, 11], fov: 45 }}
        gl={{
          antialias: settings.quality === "high",
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            setLost(true);
          });
        }}
      >
        <color attach="background" args={["#151331"]} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[4, 8, 8]} intensity={3} color="#f9e3cf" />
        <pointLight position={[-6, 2, 3]} intensity={35} color="#ad91f4" />
        <Suspense fallback={null}>
          {props.mission ? (
            <PlayWorld
              key={props.mission.id}
              {...props}
              mission={props.mission}
            />
          ) : (
            <HomeWorld />
          )}
        </Suspense>
      </Canvas>
    </GraphicsBoundary>
  );
}
