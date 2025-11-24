    import Wallet from '../models/walletModel.js'
    import Transaction from '../models/transactionModel.js'

    /* ============================================================
      TẠO QR VIỆTQR ĐỂ NẠP TIỀN VÀO VÍ
      POST /api/payments/wallet/:walletId/deposit/vietqr
    ============================================================ */
    export const createVietQRDeposit = async (req, res) => {
      try {
        const { walletId } = req.params
        const { userId, amount, description } = req.body

        if (!amount || amount <= 0) {
          return res.status(400).json({ message: 'Số tiền nạp không hợp lệ' })
        }

        const wallet = await Wallet.findById(walletId)
        if (!wallet) {
          return res.status(404).json({ message: 'Không tìm thấy ví' })
        }

        // Kiểm tra đã cấu hình tài khoản ngân hàng cho ví chưa
        if (!wallet.bankAccount_number || !wallet.bankAccount_napasCode) {
          return res.status(400).json({
            message:
              'Ví chưa liên kết tài khoản ngân hàng hoặc thiếu napasCode/số tài khoản'
          })
        }

        // Tạo mã giao dịch duy nhất
        const transRef = `DEP-${Date.now().toString(36).toUpperCase()}`

        // Tạo giao dịch ở trạng thái pending
        const transaction = await Transaction.create({
          walletId: wallet._id,
          userId,
          code: transRef,
          refCode: wallet.refCode,
          type: 'deposit',
          direction: 'in',
          category: 'vietqr',
          amount,
          fee: 0,
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance, // chưa cộng tiền
          description: description || 'Nạp tiền qua ViệtQR',
          status: 'pending',
          deviceInfo: req.headers['user-agent'] || '',
          date: new Date(),
          confirmedAt: null
        })

        // Tạo link ảnh QR từ chuẩn ViệtQR
        const baseUrl = 'https://img.vietqr.io'
        const bankCode = wallet.bankAccount_napasCode
        const accountNumber = wallet.bankAccount_number

        const qrLink =
          `https://api.vietqr.io/image/` +
          `${wallet.bankAccount_napasCode}-${wallet.bankAccount_number}-${process.env.VIETQR_TEMPLATE}.jpg` +
          `?amount=${amount}` +
          `&addInfo=${transRef}` +
          `&accountName=${encodeURIComponent(
            wallet.bankAccount_holderName || 'TEAMBILL'
          )}`

        return res.status(200).json({
          message: 'Tạo mã QR nạp tiền thành công',
          qrLink,
          transactionId: transaction._id,
          transCode: transRef,
          amount,
          bankInfo: {
            bankName: wallet.bankAccount_bankName,
            holderName: wallet.bankAccount_holderName,
            accountNumber: wallet.bankAccount_number
          }
        })
      } catch (err) {
        console.error('[createVietQRDeposit] Error:', err)
        return res.status(500).json({
          message: 'Lỗi server khi tạo QR nạp tiền',
          error: err.message
        })
      }
    }

    /* ============================================================
      XÁC NHẬN ĐÃ NẠP TIỀN (SAU KHI CHUYỂN KHOẢN)
      POST /api/payments/deposit/:transactionId/confirm
    ============================================================ */
    export const confirmVietQRDeposit = async (req, res) => {
      try {
        const { transactionId } = req.params

        const trans = await Transaction.findById(transactionId)
        if (!trans) {
          return res.status(404).json({ message: 'Không tìm thấy giao dịch' })
        }

        if (trans.status !== 'pending' || trans.type !== 'deposit') {
          return res.status(400).json({
            message:
              'Chỉ cho phép xác nhận những giao dịch nạp đang ở trạng thái pending'
          })
        }

        const wallet = await Wallet.findById(trans.walletId)
        if (!wallet) {
          return res
            .status(404)
            .json({ message: 'Không tìm thấy ví của giao dịch' })
        }

        // Cộng tiền vào ví
        wallet.balance += trans.amount
        wallet.totalDeposit += trans.amount
        wallet.lastUpdated = new Date()
        await wallet.save()

        // Cập nhật trạng thái giao dịch
        trans.status = 'completed'
        trans.balanceAfter = wallet.balance
        trans.confirmedAt = new Date()
        await trans.save()

        return res.status(200).json({
          message: 'Xác nhận nạp tiền thành công',
          wallet,
          transaction: trans
        })
      } catch (err) {
        console.error('[confirmVietQRDeposit] Error:', err)
        return res.status(500).json({
          message: 'Lỗi server khi xác nhận nạp tiền',
          error: err.message
        })
      }
    }
