# All POS logs

{service="pos"}

# All payment completions

{service="pos"} |= "Payment completed"

# All errors

{service="pos"} |= "error" | json | level="error"

# Payments by phone number

{service="pos"} | json | phone="+15551234567"

# Payments by transaction ID

{service="pos"} | json | tx_id="+15551234567_1735520000"

# All failed payments

{service="pos"} |= "Failed to send receipt"

# Revenue by vendor

{service="pos"} | json | vendor="Target"

# All successful payments

{service="pos"} |= "Payment completed successfully"

# Payments by specific phone number

{service="pos"} | json | phone="+15551234567"

# All errors

{service="pos"} | json | level="error"

# Payments by vendor

{service="pos"} | json | vendor="Target"

# Recent transactions (last 15 minutes)

{service="pos"} [15m]
