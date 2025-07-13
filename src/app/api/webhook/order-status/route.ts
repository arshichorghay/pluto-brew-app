
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, newStatus } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ message: 'Missing orderId or newStatus' }, { status: 400 });
    }

    // In a real application, you would trigger an action here.
    // For example, send a command to a Raspberry Pi, update a database, etc.
    console.log(`Webhook received: Order ${orderId} status changed to ${newStatus}`);
    console.log('Initiating action for Raspberry Pi...');

    // Simulate action
    // pi.triggerLightShow(newStatus);

    return NextResponse.json({ message: `Webhook processed for order ${orderId}` }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ message: 'An error occurred while processing the webhook.' }, { status: 500 });
  }
}
