
SHELL = /bin/sh

# V=0 quiet, V=1 verbose.  other values don't work.
V = 0
Q1 = $(V:1=)
Q = $(Q1:0=@)
ECHO1 = $(V:1=@)
ECHO = $(ECHO1:0=@echo)
NULLCMD = 

#### Start of system configuration section. ####

srcdir = .
topdir = uri:classloader:/META-INF/jruby.home/lib/ruby/stdlib
hdrdir = uri:classloader:/META-INF/jruby.home/lib/ruby/include
arch_hdrdir = $(extout)/include/$(arch)
PATH_SEPARATOR = :
VPATH = $(srcdir):$(arch_hdrdir)/ruby:$(hdrdir)/ruby:$(srcdir)/libsass/src:$(srcdir)/libsass/src/memory/:$(srcdir)/libsass/src/utf8/:$(srcdir)/libsass/src/b64/
prefix = $(DESTDIR)\ 
libdir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/lib
rubylibdir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/lib/ruby/stdlib
rubysharedlibdir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/lib/ruby/shared
sitedir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/lib/ruby/2.3/site_ruby
sitelibdir = $(DESTDIR)./.gem.20200214-8820-m1xh6u
sitearchdir = $(DESTDIR)./.gem.20200214-8820-m1xh6u
archdir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/lib/native/include
datadir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/share
mandir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/man
sysconfdir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/etc
localstatedir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/var
includedir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/lib/native/include
rubyhdrdir = $(DESTDIR)uri:classloader:/META-INF/jruby.home/lib/native/include


CC = cc
CXX = c++
LIBRUBY = 
LIBRUBY_A = 
LIBRUBYARG_SHARED = 
LIBRUBYARG_STATIC = 
empty =
OUTFLAG = -o $(empty)
COUTFLAG = -o $(empty)$(empty)

RUBY_EXTCONF_H = 
cflags   = 
cxxflags = 
optflags = 
debugflags = 
warnflags = 
CCDLFLAGS = 
CFLAGS   = $(CCDLFLAGS)  -fPIC -DTARGET_RT_MAC_CFM=0  -fno-omit-frame-pointer -fno-strict-aliasing  -fexceptions $(cflags) -march=native -mtune=native -flto -DLIBSASS_VERSION='"3.6.1"' $(ARCH_FLAG)
INCFLAGS = -I. -I$(arch_hdrdir) -I$(hdrdir)/ruby/backward -I$(hdrdir) -I$(srcdir) -I$(srcdir)/libsass/include
DEFS     = 
CPPFLAGS =   -D_XOPEN_SOURCE -D_DARWIN_C_SOURCE  $(DEFS) $(cppflags)
CXXFLAGS = $(CCDLFLAGS)  -fno-omit-frame-pointer -fno-strict-aliasing  -fexceptions $(cflags) $(cxxflags) -std=c++11 -march=native -mtune=native -flto -DLIBSASS_VERSION='"3.6.1"' -fPIC $(ARCH_FLAG)
ldflags  =  -flto
dldflags =  
ARCH_FLAG =  -arch x86_64
DLDFLAGS = $(ldflags) $(dldflags) $(ARCH_FLAG)
LDSHARED = cc -dynamic -bundle -undefined dynamic_lookup 
LDSHAREDXX = c++ -dynamic -bundle -undefined dynamic_lookup 
AR = 
EXEEXT = 

RUBY_SO_NAME = jruby

arch = java
sitearch = java
ruby_version = 2.3.0
ruby = $(bindir)/jruby
RUBY = $(ruby)
ruby_headers = $(hdrdir)/ruby.h $(hdrdir)/ruby/ruby.h $(hdrdir)/ruby/defines.h $(hdrdir)/ruby/missing.h $(hdrdir)/ruby/intern.h $(hdrdir)/ruby/st.h $(hdrdir)/ruby/subst.h $(arch_hdrdir)/ruby/config.h

RM = rm -f
RM_RF = $(RUBY) -run -e rm -- -rf
RMDIRS = $(RUBY) -run -e rmdir -- -p
MAKEDIRS = mkdir -p 
INSTALL = install -c 
INSTALL_PROG = $(INSTALL) -m 0755
INSTALL_DATA = $(INSTALL) -m 0644
COPY = cp 
TOUCH = exit >

#### End of system configuration section. ####

preload = 

libpath = . $(libdir)
LIBPATH =  -L. -L$(libdir)
DEFFILE = 

CLEANFILES = mkmf.log
DISTCLEANFILES = 
DISTCLEANDIRS = 

extout = 
extout_prefix = 
target_prefix = /sassc
LOCAL_LIBS = 
LIBS =    
ORIG_SRCS = 
SRCS = $(ORIG_SRCS) c99func.c cencode.c units.cpp fn_miscs.cpp util.cpp ast_selectors.cpp environment.cpp ast_sel_unify.cpp ast.cpp emitter.cpp bind.cpp sass_functions.cpp ast2c.cpp base64vlq.cpp context.cpp remove_placeholders.cpp node.cpp fn_colors.cpp sass_values.cpp constants.cpp ast_values.cpp lexer.cpp color_maps.cpp fn_selectors.cpp fn_numbers.cpp operators.cpp output.cpp source_map.cpp sass.cpp listize.cpp ast_fwd_decl.cpp sass_util.cpp fn_strings.cpp fn_utils.cpp ast_sel_cmp.cpp fn_maps.cpp file.cpp ast_supports.cpp check_nesting.cpp inspect.cpp extend.cpp plugins.cpp cssize.cpp sass2scss.cpp to_value.cpp prelexer.cpp subset_map.cpp utf8_string.cpp backtrace.cpp json.cpp parser.cpp util_string.cpp error_handling.cpp sass_context.cpp eval.cpp values.cpp fn_lists.cpp position.cpp expand.cpp c2ast.cpp SharedPtr.cpp
OBJS = c99func.o cencode.o units.o fn_miscs.o util.o ast_selectors.o environment.o ast_sel_unify.o ast.o emitter.o bind.o sass_functions.o ast2c.o base64vlq.o context.o remove_placeholders.o node.o fn_colors.o sass_values.o constants.o ast_values.o lexer.o color_maps.o fn_selectors.o fn_numbers.o operators.o output.o source_map.o sass.o listize.o ast_fwd_decl.o sass_util.o fn_strings.o fn_utils.o ast_sel_cmp.o fn_maps.o file.o ast_supports.o check_nesting.o inspect.o extend.o plugins.o cssize.o sass2scss.o to_value.o prelexer.o subset_map.o utf8_string.o backtrace.o json.o parser.o util_string.o error_handling.o sass_context.o eval.o values.o fn_lists.o position.o expand.o c2ast.o SharedPtr.o
HDRS = 
TARGET = libsass
TARGET_NAME = libsass
TARGET_ENTRY = Init_$(TARGET_NAME)
DLLIB = $(TARGET).bundle
EXTSTATIC = 
STATIC_LIB = 

TIMESTAMP_DIR = .
BINDIR        = $(bindir)
RUBYCOMMONDIR = $(sitedir)$(target_prefix)
RUBYLIBDIR    = $(sitelibdir)$(target_prefix)
RUBYARCHDIR   = $(sitearchdir)$(target_prefix)
HDRDIR        = $(rubyhdrdir)/ruby$(target_prefix)
ARCHHDRDIR    = $(rubyhdrdir)/$(arch)/ruby$(target_prefix)

TARGET_SO     = $(DLLIB)
CLEANLIBS     = $(TARGET).bundle 
CLEANOBJS     = *.o  *.bak

all:    $(DLLIB)
static: $(STATIC_LIB) install-rb
.PHONY: all install static install-so install-rb
.PHONY: clean clean-so clean-static clean-rb

clean-static::
clean-rb-default::
clean-rb::
clean-so::
clean: clean-so clean-static clean-rb-default clean-rb
		-$(Q)$(RM) $(CLEANLIBS) $(CLEANOBJS) $(CLEANFILES) .*.time

distclean-rb-default::
distclean-rb::
distclean-so::
distclean-static::
distclean: clean distclean-so distclean-static distclean-rb-default distclean-rb
		-$(Q)$(RM) Makefile $(RUBY_EXTCONF_H) conftest.* mkmf.log
		-$(Q)$(RM) core ruby$(EXEEXT) *~ $(DISTCLEANFILES)
		-$(Q)$(RMDIRS) $(DISTCLEANDIRS) 2> /dev/null || true

realclean: distclean
install: install-so install-rb

install-so: $(DLLIB) $(TIMESTAMP_DIR)/.RUBYARCHDIR.-.sassc.time
	$(INSTALL_PROG) $(DLLIB) $(RUBYARCHDIR)
clean-static::
	-$(Q)$(RM) $(STATIC_LIB)
install-rb: pre-install-rb install-rb-default
install-rb-default: pre-install-rb-default
pre-install-rb: Makefile
pre-install-rb-default: Makefile
pre-install-rb-default:
	@$(NULLCMD)
$(TIMESTAMP_DIR)/.RUBYARCHDIR.-.sassc.time:
	$(Q) $(MAKEDIRS) $(@D) $(RUBYARCHDIR)
	$(Q) $(TOUCH) $@

site-install: site-install-so site-install-rb
site-install-so: install-so
site-install-rb: install-rb

.SUFFIXES: .c .m .cc .mm .cxx .cpp .o .S

.cc.o:
	$(ECHO) compiling $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -c $<

.cc.S:
	$(ECHO) translating $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -S $<

.mm.o:
	$(ECHO) compiling $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -c $<

.mm.S:
	$(ECHO) translating $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -S $<

.cxx.o:
	$(ECHO) compiling $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -c $<

.cxx.S:
	$(ECHO) translating $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -S $<

.cpp.o:
	$(ECHO) compiling $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -c $<

.cpp.S:
	$(ECHO) translating $(<)
	$(Q) $(CXX) $(INCFLAGS) $(CPPFLAGS) $(CXXFLAGS) $(COUTFLAG)$@ -S $<

.c.o:
	$(ECHO) compiling $(<)
	$(Q) $(CC) $(INCFLAGS) $(CPPFLAGS) $(CFLAGS) $(COUTFLAG)$@ -c $<

.c.S:
	$(ECHO) translating $(<)
	$(Q) $(CC) $(INCFLAGS) $(CPPFLAGS) $(CFLAGS) $(COUTFLAG)$@ -S $<

.m.o:
	$(ECHO) compiling $(<)
	$(Q) $(CC) $(INCFLAGS) $(CPPFLAGS) $(CFLAGS) $(COUTFLAG)$@ -c $<

.m.S:
	$(ECHO) translating $(<)
	$(Q) $(CC) $(INCFLAGS) $(CPPFLAGS) $(CFLAGS) $(COUTFLAG)$@ -S $<

$(DLLIB): $(OBJS) Makefile
	$(ECHO) linking shared-object sassc/$(DLLIB)
	-$(Q)$(RM) $(@)
	$(Q) $(LDSHAREDXX) -o $@ $(OBJS) $(LIBPATH) $(DLDFLAGS) $(LOCAL_LIBS) $(LIBS)
	$(Q) strip -x $@



###
# Replaces default mkmf dependencies. Default mkmf dependencies include all libruby headers.
# We don't need libruby and some of these headers are missing on JRuby (breaking compilation there).
$(OBJS): $(HDRS)

