import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    
    return new Promise<NextResponse>((resolve) => {
      // Use ENGINE_BINARY_PATH from env, or default to relative path
      const exePath = process.env.ENGINE_BINARY_PATH 
        ? path.resolve(process.cwd(), process.env.ENGINE_BINARY_PATH)
        : path.resolve(process.cwd(), '../backend/chessiq_engine.exe');
      
      const child = spawn(exePath);
      
      console.log("Spawning engine at:", exePath);
      
      child.on('error', (err) => {
        console.error("Failed to spawn child:", err);
        resolve(NextResponse.json({ error: 'Spawn failed', details: err.message }, { status: 500 }));
      });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        if (code !== 0) {
          resolve(NextResponse.json({ error: 'Engine failed', details: stderr }, { status: 500 }));
        } else {
          try {
            const result = JSON.parse(stdout);
            resolve(NextResponse.json(result));
          } catch (e) {
            resolve(NextResponse.json({ error: 'Invalid JSON from engine', details: stdout }, { status: 500 }));
          }
        }
      });
      
      child.stdin.write(JSON.stringify(body) + '\n');
      child.stdin.end();
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
