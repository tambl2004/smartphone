import React from 'react';

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 min-h-screen py-16 px-6 sm:px-8 pt-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-950 dark:text-white mb-2">
          ĐIỀU KHOẢN DỊCH VỤ
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          Cập nhật lần cuối: 17 tháng 6, 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <p>
            Vui lòng đọc kỹ các Điều khoản Dịch vụ này trước khi truy cập hoặc sử dụng trang web của chúng tôi. Bằng việc truy cập hoặc sử dụng bất kỳ phần nào của trang web này, bạn đồng ý chịu sự ràng buộc bởi các Điều khoản Dịch vụ này.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              1. Điều kiện chung của tài khoản
            </h2>
            <p>
              Bằng cách đồng ý với các Điều khoản Dịch vụ này, bạn tuyên bố rằng bạn đã đủ tuổi thành niên ở tiểu bang hoặc tỉnh nơi bạn cư trú.
            </p>
            <p>
              Bạn không được sử dụng các sản phẩm của chúng tôi cho bất kỳ mục đích bất hợp pháp hoặc trái phép nào, cũng như không được vi phạm bất kỳ luật nào trong phạm vi quyền hạn của bạn khi sử dụng Dịch vụ.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              2. Đặt hàng và thanh toán
            </h2>
            <p>
              Chúng tôi có quyền từ chối bất kỳ đơn đặt hàng nào bạn đặt với chúng tôi vì các lý do hợp lý như: sản phẩm hết hàng đột xuất, thông tin định danh không chính xác hoặc nghi ngờ gian lận thanh toán.
            </p>
            <p>
              Các phương thức thanh toán được hỗ trợ bao gồm Thanh toán khi nhận hàng (COD) và Thanh toán trực tuyến qua Ví điện tử MoMo. Trường hợp giao dịch trực tuyến lỗi, quý khách có thể thực hiện thanh toán lại ở phần Lịch sử đơn hàng trong tài khoản của mình.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              3. Hủy đơn hàng và hoàn tiền
            </h2>
            <p>
              Khách hàng có thể yêu cầu hủy đơn hàng trực tiếp trên hệ thống nếu đơn hàng đó chưa chuyển sang trạng thái đang vận chuyển.
            </p>
            <p>
              Đối với các đơn hàng đã thanh toán qua MoMo thành công và sau đó được hủy thành công, số tiền hoàn lại sẽ được gửi về ví MoMo ban đầu trong vòng 3 đến 5 ngày làm việc theo đúng quy trình của đối tác ví điện tử.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              4. Chính sách bảo hành và đổi trả
            </h2>
            <p>
              Tất cả sản phẩm điện thoại di động phân phối bởi NEXPHONE đều được áp dụng chính sách bảo hành chính hãng 12 tháng.
            </p>
            <p>
              Chúng tôi hỗ trợ đổi mới 1-đổi-1 trong vòng 30 ngày kể từ ngày nhận hàng nếu sản phẩm phát sinh lỗi phần cứng từ nhà sản xuất. Sản phẩm đổi trả yêu cầu còn nguyên hộp, phụ kiện, không móp méo rơi vỡ hoặc ngấm nước do lỗi sử dụng.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              5. Thay đổi điều khoản dịch vụ
            </h2>
            <p>
              Bạn có thể xem phiên bản mới nhất của Điều khoản Dịch vụ bất kỳ lúc nào tại trang này.
            </p>
            <p>
              Chúng tôi có quyền cập nhật, thay đổi hoặc thay thế bất kỳ phần nào của các Điều khoản Dịch vụ này bằng cách đăng các cập nhật và thay đổi lên trang web của chúng tôi. Bạn có trách nhiệm kiểm tra trang web của chúng tôi định kỳ để biết các thay đổi.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Thông tin pháp lý
            </h2>
            <p>
              Mọi hoạt động giao dịch trực tuyến trên trang web tuân thủ các quy định hiện hành về thương mại điện tử của pháp luật Việt Nam.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
