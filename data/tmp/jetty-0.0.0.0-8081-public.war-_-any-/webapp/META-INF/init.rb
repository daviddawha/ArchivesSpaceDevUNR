WARBLER_CONFIG = {"public.root"=>"/", "rails.env"=>"production", "jruby.min.runtimes"=>"1", "jruby.max.runtimes"=>"1"}
if $servlet_context.nil?
  ENV['GEM_HOME'] = File.expand_path(File.join('..', '..', '/WEB-INF/gems'), __FILE__)
else
  ENV['GEM_HOME'] = $servlet_context.getRealPath('/WEB-INF/gems')
  ENV['GEM_PATH'] = nil
end
ENV['RAILS_ENV'] ||= 'production'
