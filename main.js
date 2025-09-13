 import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';

document.addEventListener('DOMContentLoaded', () => {
    const start = async () => {
        // 1. สร้าง MindAR instance
        const mindarThree = new MindARThree({
            container: document.body,
            imageTargetSrc: './target/targets.mind',
            maxTrack: 1, // ปรับเป็น 1 เพราะมี Marker แค่อันเดียว
        });

        const { renderer, scene, camera } = mindarThree;

        // เพิ่มแสงเข้าไปใน Scene (ไม่มีผลกับ MeshBasicMaterial แต่ใส่ไว้เผื่อใช้วัตถุอื่น)
        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);

        // 2. สร้าง Video Element ด้วย JavaScript
        const video = document.createElement('video');
        video.src = './video/การอีดฝ้าย.mp4'; // << ตรวจสอบว่า Path และชื่อไฟล์วิดีโอถูกต้อง
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = 'anonymous';

        // 3. สร้าง VideoTexture จาก video element
        const texture = new THREE.VideoTexture(video);
        
        // 4. สร้าง Geometry (จอภาพ) และ Material (พื้นผิววิดีโอ)
        // ขนาด 1, 0.5625 คืออัตราส่วน 16:9 ปรับได้ตามวิดีโอของคุณ
        const geometry = new THREE.PlaneGeometry(1, 0.5625);
        const material = new THREE.MeshBasicMaterial({ map: texture });

        // 5. สร้าง Mesh (วัตถุ 3 มิติที่จะแสดงผล)
        const plane = new THREE.Mesh(geometry, material);

        // *** จุดแก้ไขปัญหา ***
        // บังคับให้วิดีโออยู่ตรงกลาง (0,0,0) และไม่หมุน (0,0,0)
        plane.position.set(0, 0, 0);
        plane.rotation.set(0, 0, 0);

        // 6. สร้าง Anchor และเพิ่ม Mesh (จอวิดีโอ) เข้าไป
        const videoAnchor = mindarThree.addAnchor(0);
        videoAnchor.group.add(plane);

        // เพิ่ม Event Listener เพื่อให้วิดีโอเริ่มเล่นเมื่อเจอ Target
        videoAnchor.onTargetFound = () => {
            video.play();
        }
        // และหยุดเล่นเมื่อ Target หายไป
        videoAnchor.onTargetLost = () => {
            video.pause();
        }

        // 7. เริ่มต้นการทำงานของ MindAR
        await mindarThree.start();

        // เริ่ม Render Loop (ต้องไม่มีคำสั่งให้หมุนใดๆ ในนี้)
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });
    }

    start();
})