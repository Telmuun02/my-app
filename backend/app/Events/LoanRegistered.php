<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Loan;

class LoanRegistered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * baiguulagch
     */
    public function __construct(public Loan $loan)
    {
        //
    }

    /**
     * listener luu uguh heseg 
     */
    public function broadcastOn(): array
    {   
        return [
            // private channel ruu ilgeeh ba uuniig listener deer sonsoh bolomjtoi
            new PrivateChannel('loan' . $this->loan->id),
        ];
    }
}
