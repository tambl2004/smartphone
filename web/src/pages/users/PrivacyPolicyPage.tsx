import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 min-h-screen py-16 px-6 sm:px-8 pt-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-950 dark:text-white mb-2">
          CHÍNH SÁCH BẢO MẬT
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          Cập nhật lần cuối: 17 tháng 6, 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <p>
            Chào mừng bạn đến với NEXPHONE. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ dữ liệu cá nhân của bạn. Chính sách bảo mật này sẽ cho bạn biết cách chúng tôi chăm sóc dữ liệu cá nhân của bạn khi bạn truy cập trang web của chúng tôi và cho bạn biết về quyền riêng tư của bạn.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              1. Thông tin chúng tôi thu thập
            </h2>
            <p>
              Chúng tôi có thể thu thập, sử dụng, lưu trữ và chuyển giao các loại dữ liệu cá nhân khác nhau về bạn bao gồm:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Dữ liệu định danh:</strong> Họ, tên, tên người dùng hoặc định danh tương tự.</li>
              <li><strong>Dữ liệu liên hệ:</strong> Địa chỉ giao hàng, địa chỉ thanh toán, email và số điện thoại.</li>
              <li><strong>Dữ liệu giao dịch:</strong> Chi tiết về các khoản thanh toán đến và đi từ bạn cũng như các chi tiết khác về sản phẩm bạn đã mua từ chúng tôi.</li>
              <li><strong>Dữ liệu kỹ thuật:</strong> Địa chỉ IP, dữ liệu đăng nhập, loại trình duyệt, hệ điều hành và nền tảng.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              2. Cách chúng tôi sử dụng thông tin của bạn
            </h2>
            <p>
              Chúng tôi sẽ chỉ sử dụng dữ liệu cá nhân của bạn khi luật pháp cho phép. Thông thường, chúng tôi sẽ sử dụng dữ liệu cá nhân của bạn trong các trường hợp sau:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Để thực hiện hợp đồng mua bán sản phẩm mà chúng tôi chuẩn bị giao kết hoặc đã giao kết với bạn.</li>
              <li>Khi cần thiết cho lợi ích hợp pháp của chúng tôi và lợi ích cũng như các quyền cơ bản của bạn không đè lên các lợi ích đó.</li>
              <li>Để gửi cho bạn các thông tin cập nhật về đơn hàng, hỗ trợ kỹ thuật hoặc thông tin khuyến mại khi được bạn đồng ý.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              3. Bảo mật dữ liệu
            </h2>
            <p>
              Chúng tôi đã thiết lập các biện pháp bảo mật thích hợp để ngăn chặn dữ liệu cá nhân của bạn bị mất mát, sử dụng hoặc truy cập một cách trái phép, bị thay đổi hoặc tiết lộ một cách vô tình.
            </p>
            <p>
              Mọi dữ liệu truyền tải trên hệ thống đều sử dụng giao thức HTTPS được mã hóa bảo mật. Mật khẩu của bạn được lưu trữ dưới dạng băm bảo mật và chỉ có bạn mới có thể truy cập được.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              4. Chia sẻ thông tin với bên thứ ba
            </h2>
            <p>
              Chúng tôi chỉ cung cấp các thông tin liên hệ cần thiết cho các đơn vị vận chuyển đối tác để giao đơn hàng tới tay bạn. Chúng tôi không chia sẻ hoặc bán dữ liệu cá nhân của bạn cho bất kỳ tổ chức tiếp thị bên thứ ba nào.
            </p>
            <p>
              Khi thực hiện thanh toán trực tuyến qua cổng thanh toán MoMo hoặc ngân hàng, thông tin giao dịch của bạn sẽ được xử lý bảo mật trực tiếp bởi đối tác cung cấp dịch vụ cổng thanh toán.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">
              5. Quyền lợi của bạn
            </h2>
            <p>
              Theo quy định của pháp luật, bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất kỳ lúc nào bằng cách truy cập trang quản lý tài khoản hoặc liên hệ trực tiếp với chúng tôi.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
              Liên hệ với chúng tôi
            </h2>
            <p>
              Mọi yêu cầu hoặc thắc mắc liên quan đến chính sách bảo mật này xin vui lòng gửi về:
            </p>
            <p className="space-y-1">
              <div>• Email: privacy@nexphone.vn</div>
              <div>• Hotline: 1900 6006</div>
              <div>• Địa chỉ: Hà Nội, Việt Nam</div>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
