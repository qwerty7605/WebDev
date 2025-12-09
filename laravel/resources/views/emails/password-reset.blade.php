<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow">
                    <div class="card-header bg-primary text-white text-center">
                        <h2 class="mb-0">Password Reset Request</h2>
                    </div>
                    <div class="card-body p-4">
                        <p class="mb-3">Hello <strong>{{ $userName }}</strong>,</p>

                        <p class="mb-3">We received a request to reset your password for your <strong>{{ ucfirst($userType) }}</strong> account in the Complaint Management System.</p>

                        <p class="mb-3">Click the button below to reset your password:</p>

                        <div class="text-center my-4">
                            <a href="{{ $resetUrl }}" class="btn btn-primary btn-lg">Reset Password</a>
                        </div>

                        <p class="mb-2">Or copy and paste this link into your browser:</p>
                        <div class="alert alert-secondary" role="alert">
                            <small class="text-break">{{ $resetUrl }}</small>
                        </div>

                        <div class="alert alert-warning" role="alert">
                            <h6 class="alert-heading">Important:</h6>
                            <ul class="mb-0">
                                <li>This link will expire in <strong>1 hour</strong></li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Your password will remain unchanged until you create a new one</li>
                            </ul>
                        </div>
                    </div>
                    <div class="card-footer text-center text-muted">
                        <small>This is an automated email from Complaint Management System</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
